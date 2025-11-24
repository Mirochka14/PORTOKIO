(function() {

    function generateUniquePFID() {
        return 'pf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    window.addPortfolio = function(pf) {
        let portfolios;
        try {
            portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
        } catch(e) { portfolios = []; }
        if (!Array.isArray(portfolios)) portfolios = [];

        pf.id = generateUniquePFID();
        pf.created = Date.now();

        portfolios.push(pf);

        localStorage.setItem('portfolios', JSON.stringify(portfolios));
    };

    let path = window.location.pathname;
    if (!/watch_port\.html$|my_portfolio\.html$/i.test(path)) return;

    let container = document.querySelector('.portfolio_div');
    if (!container) return;

    // ---- Сортировка ----
    let sortDiv = document.createElement('div');
    sortDiv.style.margin = "24px 0 20px 0";
    sortDiv.style.display = "flex";
    sortDiv.style.alignItems = "center";
    sortDiv.style.gap = "16px";
    sortDiv.style.fontSize = "1.12em";
    sortDiv.innerHTML = `
      <b style="color:#E1749E;font-size:1.13em">Сортировка:</b>
      <select id="pf-sort-mode" style="padding:4px 16px;border-radius:10px;border:1px solid #e5c1cf;background:#fff;font-size:1em;">
        <option value="newest" selected>Самые новые</option>
        <option value="oldest">Самые старые</option>
      </select>
    `;
    container.insertBefore(sortDiv, container.firstChild);

    function formatDate(ts) {
        if (!ts) return '';
        let d = new Date(ts);
        let dd = '0'+d.getDate(); dd = dd.substr(-2);
        let mm = '0'+(d.getMonth()+1); mm = mm.substr(-2);
        let yyyy = d.getFullYear();
        let hh = '0'+d.getHours(); hh = hh.substr(-2);
        let mi = '0'+d.getMinutes(); mi = mi.substr(-2);
        return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
    }
    
    function escapeHTML(str) {
        return (str||'').replace(/[<>&"]/g, function(c) {
            return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
        });
    }

    function renderPortfolio(sortMode) {
        let art = container.querySelector('#portfolio');
        if (!art) {
            art = document.createElement('article');
            art.id = 'portfolio';
            container.appendChild(art);
        }
        art.innerHTML = '';

        let portfolios;
        try {
            portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
        } catch(e) { portfolios = []; }
        
        if (!Array.isArray(portfolios) || !portfolios.length) {
            art.innerHTML = `<div style="font-size:1.5em; color:#E1749E; text-align:center; margin-top:90px;">Портфолио пока нет</div>`;
            return;
        }

        let onlyMine = /my_portfolio\.html$/i.test(path);
        let user = localStorage.getItem('currentUser');
        let show = onlyMine && user ? portfolios.filter(p=>p.user===user) : portfolios;

        if (!show.length) {
            art.innerHTML = `<div style="font-size:1.1em; color:#e1749e99; text-align:center; margin-top:70px;">Нет портфолио</div>`;
            return;
        }

        // Сортировка
        if (sortMode === 'oldest') {
            show = show.slice().sort((a,b)=>(a.created||0)-(b.created||0));
        } else {
            show = show.slice().sort((a,b)=>(b.created||0)-(a.created||0));
        }

        show.forEach(function(pf, idx) {
            let carouselID = `pfcrsl-${idx}-${Math.random().toString(36).slice(2,8)}`;
            let imagesHTML = '';
            
            if (pf.images && pf.images.length) {
                imagesHTML += `
                    <div class="pf-carousel" id="${carouselID}" style="max-width:380px; margin:auto; display:flex; flex-direction:column; align-items:center;">
                        <img style="max-width:340px; max-height:200px; min-height:110px; border-radius:13px; box-shadow:0px 2px 18px #e1749e33; margin-bottom:10px; object-fit:cover;" src="${pf.images[0]}" alt="Фото работы">
                        <div style="display:flex;gap:15px;">
                            <button type="button" class="pf-prev" style="background:#e1749e;color:#fff;border:none;border-radius:9px;width:35px;height:35px;font-size:1.22em;display:${pf.images.length>1?'':'none'};cursor:pointer;">‹</button>
                            <button type="button" class="pf-next" style="background:#e1749e;color:#fff;border:none;border-radius:9px;width:35px;height:35px;font-size:1.22em;display:${pf.images.length>1?'':'none'};cursor:pointer;">›</button>
                        </div>
                    </div>
                `;
            }

            art.innerHTML += `
                <div class="portfolio-block" data-pid="${pf.id}" style="background:#fff3f9;border-radius:25px;box-shadow:0 2px 13px #e1749e26;padding:32px 31px;margin-bottom:36px;display:flex;gap:36px;align-items:flex-start;">
                    ${imagesHTML}
                    <div style="flex:1;min-width:240px;">
                        <div style="font-size:1.5em;font-weight:800;color:#e1749e;margin-bottom:8px">${escapeHTML(pf.title||'')}</div>
                        <div style="font-size:1.08em;color:#4d2531;margin-bottom:14px">${escapeHTML(pf.description||'').replace(/\n/g,'<br>')}</div>
                        <div style="color:#85838c;font-size:0.97em;margin-bottom:6px">
                            ${pf.links ? ('Ссылки: '+pf.links.split(/\s*,\s*/).map(l=>`<a href="${l}" target="_blank" style="color:#bb3a6c;text-decoration:underline">${l.replace(/^(https?:\/\/)?(www\.)?/,'')}</a>`).join(', ')) : ''}
                        </div>
                        <div style="font-size:0.90em;color:#aaa;margin-top:13px;">
                            Пользователь: <b>${escapeHTML(pf.user||'')}</b> · ${pf.created ? formatDate(pf.created) : ''}
                        </div>
                    </div>
                </div>
            `;

            // Инициализация карусели
            setTimeout(function() {
                let crsl = document.getElementById(carouselID);
                if (!crsl) return;
                let imgEl = crsl.querySelector('img');
                let prevB = crsl.querySelector('.pf-prev');
                let nextB = crsl.querySelector('.pf-next');
                if (!imgEl || !prevB || !nextB) return;
                let cidx = 0;
                prevB.onclick = function() {
                    cidx = (cidx-1 + pf.images.length) % pf.images.length;
                    imgEl.src = pf.images[cidx];
                };
                nextB.onclick = function() {
                    cidx = (cidx+1) % pf.images.length;
                    imgEl.src = pf.images[cidx];
                };
            });
        });
    }

    // Инициализация
    window.renderPortfolio = renderPortfolio;
    renderPortfolio('newest');

    document.getElementById('pf-sort-mode').onchange = function(e) { 
        renderPortfolio(e.target.value); 
    };

})();