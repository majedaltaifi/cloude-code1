import re

def migrate():
    with open('Mobile App.html', 'r', encoding='utf-8') as f:
        content = f.read()

    new_js = """        const API = window.location.origin;
        let currentUser = null;

        let reports = [], notifs = [], readLocally = new Set(), activeRoom = null, isDirectMode = false, isP2P = false, targetPeer = null, imgB64 = null, unreadChats = {};
        let currentType = 'safety', currentSubType = '';
        let unsubChat = null, unsubDirect = null, unsubP2P = null;

        const subCats = {
            safety: ['Fire Hazard', 'Personal Injury', 'Spillage', 'Slip/Trip'],
            materials: ['Low Stock', 'Damaged Item', 'Wrong Receipt', 'Quality Issue'],
            mechanical: ['Noisy Engine', 'Fluid Leak', 'Elec. Failure', 'Machine Off'],
            other: ['General inquiry', 'Personal request', 'Site observation']
        };
        let currentFilter = 'all', lastScreen = 'home', hrNews = [];

        async function initApp() {
            const saved = localStorage.getItem('nit_user');
            if (saved) {
                currentUser = JSON.parse(saved);
                document.getElementById('s-login').style.display = 'none';
                updateProfileUI();
                startHub();
            } else {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById('s-login').style.display = 'flex';
                document.querySelector('.navbar').style.display = 'none';
            }
        }

        async function startHub() {
            if (!currentUser) return;
            updateProfileUI();

            db.collection('employees').doc(currentUser.emp_no).get().then(docRef => {
                if(docRef.exists) {
                    currentUser = { ...currentUser, ...docRef.data() };
                    localStorage.setItem('nit_user', JSON.stringify(currentUser));
                    updateProfileUI();
                }
            }).catch(e => { });

            sync(); loadNotifs(); initDirectWS();
            renderSubTypes(); fetchHRNews(); fetchUnreadChats(); renderChatHub();
            db.collection('employees').doc(currentUser.emp_no).update({ is_online: true }).catch(()=>{});
            
            setInterval(sync, 5000); setInterval(loadNotifs, 5000); setInterval(fetchHRNews, 5000); setInterval(fetchUnreadChats, 5000); setInterval(renderChatHub, 5000);
        }

        function updateProfileUI() {
            if (!currentUser) return;
            const engName = currentUser.name_en || currentUser.name || currentUser.name_ar || 'NIT Officer';
            const siteRaw = currentUser.site || 'Field Operations';
            const siteEng = siteRaw.match(/\\((.*?)\\)/) ? siteRaw.match(/\\((.*?)\\)/)[1] : siteRaw.replace(/[^\\x00-\\x7F]/g, "").trim() || siteRaw;

            document.getElementById('dr-name').innerText = engName;
            document.getElementById('dr-id').innerText = '#' + currentUser.emp_no;
            document.getElementById('hm-name').innerText = engName;
            document.getElementById('hm-id').innerText = `EMP ID: #${currentUser.emp_no} • ${siteEng}`;
            document.getElementById('supp-name-disp').value = engName;
            document.getElementById('supp-id-disp').value = '#' + currentUser.emp_no;
        }

        async function doLogin() {
            const id = document.getElementById('login-id').value.trim();
            const btn = document.getElementById('login-btn'), err = document.getElementById('login-err');
            if (!id) return;
            btn.innerText = 'VERIFYING...'; err.style.display = 'none';
            try {
                const docSnap = await db.collection('employees').doc(id).get();
                if (!docSnap.exists) throw new Error('ID_NOT_FOUND');
                
                currentUser = docSnap.data();
                if (!currentUser.emp_no) currentUser.emp_no = id;
                localStorage.setItem('nit_user', JSON.stringify(currentUser));

                document.getElementById('s-login').style.display = 'none';
                document.querySelector('.navbar').style.display = 'flex';
                switchScreen('home', 'bn-home');
                updateProfileUI();
                db.collection('employees').doc(currentUser.emp_no).update({ is_online: true }).catch(()=>{});
                startHub();
            } catch (e) {
                err.style.display = 'block';
                btn.innerText = 'SIGN IN';
            }
        }

        function doLogout() {
            localStorage.removeItem('nit_user');
            if(currentUser) {
                db.collection('employees').doc(currentUser.emp_no).update({ is_online: false }).catch(()=>{});
            }
            location.reload();
        }

        function initDirectWS() {
            if (unsubDirect) unsubDirect();
            const sid = `direct_${currentUser.emp_no}`;
            unsubDirect = db.collection('chat_messages').where('session_id', '==', sid).where('created_at', '>', new Date().toISOString()).onSnapshot(snap => {
                snap.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const d = change.doc.data();
                        const isCur = isDirectMode && activeRoom === 'admin';
                        if (d.role === 'admin') {
                            if (!isCur) {
                                showToast(`Admin: ${d.message || d.content}`);
                                unreadChats[sid] = (unreadChats[sid] || 0) + 1;
                                updateChatBadges();
                            } else {
                                appendMsg(d);
                            }
                        }
                    }
                });
            });
        }

        async function fetchHRNews() {
            try {
                const snap = await db.collection('broadcasts').orderBy('updated_at', 'desc').limit(5).get();
                hrNews = snap.docs.map(d => ({id: d.id, ...d.data()}));
                renderHRNews();
            } catch (e) { }
        }

        async function fetchUnreadChats() {
            try {
                const snap = await db.collection('chat_messages').where('is_read', '==', false).where('participants', 'array-contains', currentUser.emp_no).get();
                unreadChats = {};
                snap.docs.forEach(doc => {
                    const d = doc.data();
                    if(d.sender_no !== currentUser.emp_no) {
                        unreadChats[d.session_id] = (unreadChats[d.session_id] || 0) + 1;
                    }
                });
                updateChatBadges();
            } catch (e) { }
        }

        function updateChatBadges() {
            let total = 0; Object.values(unreadChats).forEach(c => total += c);
            const dot = document.getElementById('chat-global-badge');
            if (dot) {
                dot.innerText = total > 9 ? '9+' : total;
                dot.style.display = total > 0 ? 'flex' : 'none';
            }
            const navBadge = document.querySelector('#bn-chat-hub .badge-unread');
            if (navBadge) {
                navBadge.innerText = total > 9 ? '9+' : total;
                navBadge.style.display = total > 0 ? 'flex' : 'none';
            }
            if (document.getElementById('s-chat-list').classList.contains('active')) renderChatHub();
        }

        async function markChatRead(sid) {
            try {
                const snap = await db.collection('chat_messages').where('session_id', '==', sid).where('is_read', '==', false).get();
                const batch = db.batch();
                snap.docs.forEach(doc => {
                    if(doc.data().sender_no !== currentUser.emp_no) batch.update(doc.ref, {is_read: true});
                });
                await batch.commit();
                delete unreadChats[sid]; updateChatBadges();
            } catch (e) { }
        }

        function renderHRNews() {
            const h = document.getElementById('news-list-home');
            if (!h || !hrNews || !hrNews.length) return;
            h.innerHTML = hrNews.map(n => {
                const iconCls = n.icon ? (n.icon.startsWith('fa-') ? `fas ${n.icon}` : n.icon) : 'fas fa-info-circle';
                return `<div class="news-item"><div class="news-icon"><i class="${iconCls}"></i></div><div class="news-txt"><span class="news-label">${n.title}</span><span class="news-value">${n.content}</span></div></div>`;
            }).join('');
        }

        async function loadNotifs() {
            try {
                const snap = await db.collection('notifications').where('emp_no', 'in', [currentUser.emp_no, null]).orderBy('created_at', 'desc').limit(20).get();
                notifs = snap.docs.map(d => {
                    let n = {id: d.id, ...d.data()};
                    if (readLocally.has(n.id)) n.is_read = true;
                    return n;
                });
                renderNotifs();
            } catch (e) { }
        }

        function renderNotifs() {
            const container = document.getElementById('notif-list');
            if (!container) return;
            const unreadCount = notifs.filter(n => !n.is_read).length;
            const bellDot = document.getElementById('bell-dot');
            if (bellDot) bellDot.style.display = unreadCount > 0 ? 'block' : 'none';

            container.innerHTML = notifs.map(n => `
                <div class="notif-card ${!n.is_read ? 'unread' : ''}" onclick="handleNotifClick('${n.id}', '${n.report_id || ''}')">
                    ${!n.is_read ? '<div class="dot"></div>' : ''}
                    <div style="font-size:10px; font-weight:900; color:var(--accent); margin-bottom:5px">${n.created_at}</div>
                    <div style="font-size:14px; font-weight:900; color:var(--primary)">${n.title || n.title_ar}</div>
                    <div style="font-size:12px; color:#64748b; margin-top:5px; font-weight:900">${n.body || n.body_ar}</div>
                </div>`).join('') || '<div style="text-align:center; padding:50px; opacity:0.5; font-weight:900">No Notifications</div>';
        }

        async function handleNotifClick(id, rid) {
            readLocally.add(id);
            const idx = notifs.findIndex(x => x.id === id);
            if (idx !== -1) { notifs[idx].is_read = true; renderNotifs(); }
            try { await db.collection('notifications').doc(id).update({is_read: true}); } catch (e) { }
            if (rid) openDetail(rid);
        }

        async function sync() {
            try {
                const snap = await db.collection('reports').where('emp_no', '==', currentUser.emp_no).orderBy('created_at', 'desc').get();
                reports = snap.docs.map(d => ({id: d.id, ...d.data()}));
                renderReports(); updateStats();
            } catch (e) { }
        }

        function updateStats() {
            const total = reports.length, done = reports.filter(r => r.status && r.status.toLowerCase() === 'done').length, pend = total - done;
            if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
            if (document.getElementById('stat-done')) document.getElementById('stat-done').innerText = done;
            if (document.getElementById('stat-pend')) document.getElementById('stat-pend').innerText = pend;
            filterAndShow(currentFilter);
        }

        function filterAndShow(status, element = null) {
            currentFilter = status;
            const lbl = document.getElementById('stat-activity-lbl');
            const activity = document.getElementById('stat-activity');
            if (!activity || !lbl) return;

            document.querySelectorAll('.stat-box').forEach(b => b.classList.remove('stat-card-active'));
            if (element) element.classList.add('stat-card-active');
            else {
                const id = status === 'all' ? 'card-all' : (status === 'pending' ? 'card-pending' : 'card-done');
                const btn = document.getElementById(id);
                if (btn) btn.classList.add('stat-card-active');
            }

            let filtered = [];
            if (status === 'all') { filtered = reports; lbl.innerText = 'RECENT ACTIVITY'; }
            else if (status === 'pending') { filtered = reports.filter(r => r.status && r.status.toLowerCase() !== 'done'); lbl.innerText = 'FILTERED: PENDING'; }
            else if (status === 'done') { filtered = reports.filter(r => r.status && r.status.toLowerCase() === 'done'); lbl.innerText = 'FILTERED: COMPLETED'; }

            activity.innerHTML = filtered.map(r => `
                <div style="background:white; padding:15px; border-radius:18px; border:1.5px solid #f1f5f9; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;" onclick="lastScreen='stats'; openDetail('${r.id}')">
                    <div style="flex:1">
                        <div style="font-size:12px; font-weight:900; color:var(--primary)">${(r.description||'').substring(0, 35)}...</div>
                        <div style="font-size:9px; font-weight:950; color:${(r.status || '').toLowerCase() === 'done' ? '#22c55e' : '#38bdf8'}; margin-top:3px">${(r.type || '').toUpperCase()} | ${(r.status || '').toUpperCase()}</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color:#cbd5e1; font-size:12px"></i>
                </div>`).join('') || `<div style="text-align:center; padding:30px; opacity:0.5; font-weight:900">No ${status} reports found</div>`;
        }

        function switchScreen(id, mid = null) {
            const active = document.querySelector('.screen.active');
            if (active && !['detail', 'chat'].includes(id)) lastScreen = active.id.replace('s-', '');

            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const target = document.getElementById('s-' + id);
            if (target) target.classList.add('active');

            document.querySelectorAll('.drawer-item').forEach(i => i.classList.remove('active'));
            if (mid) { const m = document.getElementById(mid); if (m) m.classList.add('active'); }

            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            if (id === 'home') document.getElementById('bn-home').classList.add('active');
            if (id === 'reports') document.getElementById('bn-reports').classList.add('active');
            if (id === 'create') document.getElementById('bn-create').classList.add('active');
            if (id === 'chat-list') document.getElementById('bn-chat-hub').classList.add('active');
            if (id === 'support') document.getElementById('bn-help').classList.add('active');

            const isChatOrDetail = (id === 'chat' || id === 'detail');
            document.querySelector('.navbar').style.display = isChatOrDetail ? 'none' : 'flex';
            document.querySelector('.wa-fixed').style.display = isChatOrDetail ? 'none' : 'flex';

            if (id === 'home' || id === 'reports') sync();
            if (id === 'chat-list') renderChatHub();
            if (id === 'notifs') loadNotifs();
            closeDrawer();
        }

        function goBack() { switchScreen(lastScreen); }
        function setType(t, e) { currentType = t; document.querySelectorAll('.type-grid .type-box').forEach(b => b.classList.remove('active')); e.classList.add('active'); renderSubTypes(); }
        function setSubType(t) { currentSubType = t; renderSubTypes(); }
        function renderSubTypes() {
            const container = document.getElementById('sub-types');
            const items = subCats[currentType] || [];
            container.innerHTML = items.map(s => `<div class="sub-type-item ${currentSubType === s ? 'active' : ''}" onclick="setSubType('${s}')">${s}</div>`).join('');
        }
        function handleImg(input) { const f = input.files[0]; const r = new FileReader(); r.onload = (e) => { imgB64 = e.target.result; document.getElementById('prevImg').src = imgB64; document.getElementById('prevImg').style.display = 'block'; document.getElementById('phold').style.display = 'none'; }; r.readAsDataURL(f); }

        async function doSubmit() {
            const ds = document.getElementById('f-desc').value.trim();
            const chosenSite = document.getElementById('f-site').value;
            if (!ds) return alert('Enter details');
            document.getElementById('subBtn').innerText = 'Syncing...';
            const dsBody = currentSubType ? `[${currentSubType}] ${ds}` : ds;
            try {
                const tsString = new Date().toISOString();
                const dOnly = tsString.split('T')[0];
                const ref = await db.collection('reports').add({
                    emp_no: currentUser.emp_no, type: currentType, priority: 'Normal', site: chosenSite, description: dsBody, photo_b64: imgB64,
                    status: 'open', created_at: tsString, created_on: dOnly, updated_on: dOnly
                });
                await db.collection('reports').doc(ref.id).collection('timeline').add({
                    event_text: 'Case Logged', event_by: 'System', color: 'var(--accent)', created_at: tsString
                });
                alert('Sent!'); document.getElementById('f-desc').value = ''; currentSubType = ''; renderSubTypes(); imgB64 = null; document.getElementById('prevImg').style.display = 'none'; document.getElementById('phold').style.display = 'flex'; switchScreen('reports');
            } catch (e) { alert('Connection Error: ' + e); }
            document.getElementById('subBtn').innerText = 'SUBMIT CASE';
        }

        async function submitHelp() {
            const subj = document.getElementById('supp-subj').value.trim();
            const msg = document.getElementById('supp-msg').value.trim();
            const mob = document.getElementById('supp-mobile').value.trim();
            const email = document.getElementById('supp-email').value.trim();

            if (!msg || !subj) return alert('Subject and details required');
            try {
                await db.collection('support_requests').add({
                    name: currentUser.name_ar || currentUser.name, emp_no: currentUser.emp_no, phone: mob, email: email, message: msg, subject: subj,
                    created_at: new Date().toISOString(), status: 'pending'
                });
                alert('Inquiry Submitted!'); document.getElementById('supp-subj').value = ''; document.getElementById('supp-msg').value = ''; switchScreen('home');
            } catch (e) { }
        }

        function renderReports() {
            const f = document.getElementById('full-l'), m = document.getElementById('mini-l');
            const card = document.getElementById('latest-case-card'), none = document.getElementById('no-case-card');
            if (!f || !m) return;
            f.innerHTML = reports.map(i => {
                const isClosed = (i.status || '').toLowerCase() === 'done';
                return `<div class="ticket-item" onclick="lastScreen='reports'; openDetail('${i.id}')" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div class="t-body" style="color:var(--accent); text-transform:uppercase; font-size:14px; margin-bottom:2px">${i.type}</div>
                        <div style="font-size:11px; font-weight:900; color:var(--primary)">${(i.description||'').substring(0, 45)}...</div>
                        <div style="font-size:9px; font-weight:950; color:${isClosed ? '#22c55e' : '#38bdf8'}; margin-top:4px">CASE #${(i.id||'').substring(0,5)} | ${isClosed ? 'DONE' : 'IN PROG'}</div>
                    </div>
                </div>`;
            }).join('') || 'No data';

            if (reports.length === 0) {
                if (card) card.style.display = 'none';
                if (none) none.style.display = 'block';
                return;
            }
            if (card) card.style.display = 'block';
            if (none) none.style.display = 'none';

            m.innerHTML = reports.slice(0, 3).map(i => {
                const isDone = (i.status || '').toLowerCase() === 'done';
                const desc = i.description || '';
                const subType = desc.match(/\\[(.*?)\\]/) ? desc.match(/\\[(.*?)\\]/)[0] : desc.substring(0, 30) + '...';

                return `
                    <div style="margin-bottom:25px; border-bottom:1.5px solid #f1f5f9; padding-bottom:15px">
                        <div style="background:#f8fafc; padding:15px; border-radius:18px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="lastScreen='home'; openDetail('${i.id}')">
                            <div>
                                <div style="font-size:14px; font-weight:900; color:var(--accent); text-transform:uppercase; margin-bottom:2px">${i.type}</div>
                                <div style="font-size:11px; font-weight:900; color:var(--primary)">${subType}</div>
                                <div style="font-size:9px; font-weight:950; color:#94a3b8; margin-top:4px">CASE #${(i.id||'').substring(0,5)} • ${i.site}</div>
                            </div>
                            <div class="activity-pill ${isDone ? 'done' : ''}" style="font-size:9px">${isDone ? 'CLOSED' : 'RUNNING'}</div>
                        </div>
                        <div id="home-tl-${i.id}" style="margin-top:15px; padding-left:5px">
                            <div style="font-size:10px; opacity:0.5">Syncing history...</div>
                        </div>
                    </div>
                `;
            }).join('');
            reports.slice(0, 3).forEach(i => loadLatestTimeline(i.id, `home-tl-${i.id}`));
        }

        async function loadLatestTimeline(id, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            try {
                const rData = reports.find(r => r.id === id);
                const isDone = rData && (rData.status || '').toLowerCase() === 'done';
                const snap = await db.collection('reports').doc(id).collection('timeline').orderBy('created_at', 'asc').get();
                let events = [];
                snap.docs.forEach(d => events.push(d.data()));
                if (isDone) events.push({ color: 'var(--success)', event_text: 'Case Resolved', created_at: rData.updated_on || '', event_by: 'Management' });
                container.innerHTML = events.slice(-3).map((t, idx, arr) => `
                    <div style="display:flex; gap:12px; margin-bottom:12px">
                        <div style="width:2px; background:#e2e8f0; position:relative; margin:4px 0">
                            <div style="position:absolute; top:0; left:-3.5px; width:9px; height:9px; background:${t.color || 'var(--accent)'}; border-radius:50%; border:2px solid white; box-shadow:0 0 0 1px #f1f5f9"></div>
                            ${idx < arr.length - 1 ? '<div style="position:absolute; top:10px; bottom:-12px; left:0px; width:2px; background:#e2e8f0"></div>' : ''}
                        </div>
                        <div>
                            <div style="font-size:10px; font-weight:900; color:var(--primary)">${t.event_text}</div>
                            <div style="font-size:8px; color:#94a3b8; font-weight:950; margin-top:1px">${(t.created_at||'').substring(0,10)}${t.event_by ? ' • ' + t.event_by : ''}</div>
                        </div>
                    </div>
                `).join('');
            } catch (e) { }
        }

        async function openDetail(id) {
            try {
                const rData = reports.find(r => r.id === id);
                if(!rData) return;
                const status = (rData.status || '').toLowerCase();
                const isDone = status === 'done';
                let img = rData.photo_b64 ? `<div style="margin-top:20px; border-radius:20px; overflow:hidden; border:1px solid #e2e8f0"><img src="${rData.photo_b64}" style="width:100%; display:block"></div>` : '';
                const desc = rData.description || '';
                const subType = desc.match(/\\[(.*?)\\]/) ? desc.match(/\\[(.*?)\\]/)[0] : '';
                const userDetail = desc.replace(subType, '').trim();

                const snap = await db.collection('reports').doc(id).collection('timeline').orderBy('created_at', 'asc').get();
                let tl = snap.docs.map(d=>d.data());

                document.getElementById('det-cont').innerHTML = `
                    <div style="margin-top:20px">
                        <div style="background:white; padding:25px; border-radius:28px; border:1px solid #e2e8f0;">
                            <span class="lbl">Summary</span>
                            <h2 style="font-weight:900; color:var(--accent); font-size:17px; margin-bottom:15px; text-transform:uppercase">${rData.type} ${subType}</h2>
                            <div style="display:flex; gap:15px; border-top:1.5px solid #f1f5f9; padding-top:15px">
                                <div style="flex:1"><span class="lbl">Site</span><p style="font-weight:900; font-size:14px">${rData.site}</p></div>
                                <div style="flex:1"><span class="lbl">Status</span><p style="font-weight:900; font-size:14px; color:${isDone ? '#22c55e' : '#38bdf8'}">${isDone ? 'Closed' : 'Running'}</p></div>
                            </div>
                            <div style="border-top:1.5px solid #f1f5f9; padding-top:15px; margin-top:0px">
                                <span class="lbl">Case Details</span>
                                <p style="font-weight:900; font-size:14px; color:var(--primary)">${userDetail || 'No additional details provided.'}</p>
                            </div>
                        </div>
                        ${img}
                        <div style="margin-top:30px">
                            <span class="lbl">FULL CASE JOURNEY</span>
                            <div style="margin-top:15px">
                                ${tl.map((t, idx) => `
                                    <div style="display:flex; gap:15px; margin-bottom:20px">
                                        <div style="width:2px; background:#e2e8f0; position:relative; margin:5px 0">
                                            <div style="position:absolute; top:0; left:-4px; width:10px; height:10px; background:${t.color || 'var(--accent)'}; border-radius:50%; border:2px solid white; box-shadow:0 0 0 2px #f1f5f9"></div>
                                            ${idx < tl.length - 1 || isDone ? '<div style="position:absolute; top:10px; bottom:-20px; left:0px; width:2px; background:#e2e8f0"></div>' : ''}
                                        </div>
                                        <div>
                                            <div style="font-size:13px; font-weight:900; color:var(--primary)">${t.event_text}</div>
                                            <div style="font-size:10px; color:#94a3b8; font-weight:950; margin-top:2px">${(t.created_at||'').substring(0,10)} • ${t.event_by}</div>
                                        </div>
                                    </div>
                                `).join('')}
                                ${isDone ? `
                                    <div style="display:flex; gap:15px; margin-bottom:20px">
                                        <div style="width:2px; background:transparent; position:relative; margin:5px 0">
                                            <div style="position:absolute; top:0; left:-4px; width:10px; height:10px; background:var(--success); border-radius:50%; border:2px solid white; box-shadow:0 0 0 2px #f1f5f9"></div>
                                        </div>
                                        <div>
                                            <div style="font-size:13px; font-weight:900; color:var(--primary)">Case Resolved</div>
                                            <div style="font-size:10px; color:var(--success); font-weight:950; margin-top:2px">${rData.updated_on}</div>
                                        </div>
                                    </div>
                                ` : ''}

                            </div>
                        </div>
                    </div>
                `;
                switchScreen('detail');
            } catch (e) { }
        }

        async function searchPeers() {
            const q = document.getElementById('emp-search').value.trim();
            const resBox = document.getElementById('peer-results');
            if (!q) { resBox.style.display = 'none'; return; }
            try {
                let emps = [];
                if(!isNaN(q)) {
                    const snap = await db.collection('employees').where('emp_no','==', q).get();
                    if(!snap.empty) emps.push(snap.docs[0].data());
                } else {
                    const snap = await db.collection('employees').where('name_en', '>=', q).where('name_en', '<=', q + '\\uf8ff').limit(10).get();
                    emps = snap.docs.map(d=>d.data());
                }
                resBox.style.display = 'block';
                resBox.innerHTML = '<span class="lbl">FOUND COLLEAGUES</span>' + emps.filter(e => e.emp_no != currentUser.emp_no).map(e => `
                    <div style="background:white; padding:12px 18px; border-radius:15px; border:1.5px solid #f1f5f9; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="openPrivateChat('${e.emp_no}', '${(e.name_en || e.name).replace(/'/g,"\\\\'")}')">
                        <div>
                            <div style="font-size:13px; font-weight:950; color:var(--primary)">${e.name_en || e.name}</div>
                            <div style="font-size:10px; font-weight:900; color:var(--accent)">ID: #${e.emp_no} • ${e.department}</div>
                        </div>
                        <div style="position:relative">
                            <i class="fas fa-paper-plane" style="color:var(--accent); opacity:0.5"></i>
                            ${e.is_online ? '<div class="online-dot"></div>' : ''}
                        </div>
                    </div>
                `).join('') + (emps.length === 0 ? '<div style="font-size:11px; opacity:0.5; text-align:center; padding:20px">No colleagues found</div>' : '');
            } catch (e) { }
        }

        async function openPrivateChat(eno, name) {
            document.getElementById('emp-search').value = '';
            document.getElementById('peer-results').style.display = 'none';
            lastScreen = 'chat-list';
            isDirectMode = false; isP2P = true; targetPeer = { emp_no: eno, name: name };
            const ids = [currentUser.emp_no, eno].sort();
            activeRoom = `p2p_${ids[0]}_${ids[1]}`;
            markChatRead(activeRoom);

            document.getElementById('chat-input-area').style.display = 'flex';
            document.getElementById('chat-lock-area').style.display = 'none';
            document.getElementById('chat-title').innerText = name;
            switchScreen('chat');
            initChatWS(activeRoom);
            
            try {
                const snap = await db.collection('chat_messages').where('session_id', '==', activeRoom).orderBy('created_at', 'asc').get();
                document.getElementById('chat-msgs').innerHTML = snap.docs.map(m => renderMsg(m.data())).join('');
                const c = document.getElementById('chat-msgs'); c.scrollTop = c.scrollHeight;
            } catch (e) { }
        }

        async function renderChatHub() {
            const container = document.getElementById('chat-report-list');
            const circles = document.getElementById('active-peers');
            if (!container || !circles) return;

            let circleHTML = `<div class="peer-node" onclick="openDirectChat()"><div class="peer-circ" style="border-color:#e2e8f0"><div class="icon-placeholder" style="background:#f1f5f9; color:var(--primary)"><i class="fas fa-headset"></i></div></div><span class="peer-name-mini">Admin</span></div>`;
            circles.innerHTML = circleHTML;

            const sidDir = `direct_${currentUser.emp_no}`;
            const unreadDirect = unreadChats[sidDir] || 0;
            let latestDirect = 'Direct communication with CIT Admin';
            let directTime = 0;
            try {
                const dirSnap = await db.collection('chat_messages').where('session_id', '==', sidDir).orderBy('created_at', 'desc').limit(1).get();
                if(!dirSnap.empty) {
                    const m = dirSnap.docs[0].data();
                    const prefix = m.role === 'admin' ? 'Admin: ' : 'Me: ';
                    latestDirect = prefix + (m.content || m.message || '');
                    directTime = new Date(m.created_at).getTime();
                }
            } catch(e){}

            const directData = {
                time: directTime,
                html: `<div class="chat-hub-row" onclick="openDirectChat()" style="background:#e0f2fe; border-radius:24px; margin-bottom:15px; border:1px solid #bae6fd; padding:18px"><div class="row-icon-cell"><div class="row-icon-circ" style="background:var(--primary); color:white; width:46px; height:46px;"><i class="fas fa-user-shield"></i></div></div><div class="row-main" style="padding-left:10px"><div class="row-header"><span class="row-title" style="font-size:15px">Management Support</span><span class="row-date" style="color:var(--accent)">${directTime ? new Date(directTime).toLocaleDateString('en-GB') : ''}</span></div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px"><div class="row-subtext" style="color:#64748b; font-size:13px; font-weight:900">${latestDirect}</div>${unreadDirect > 0 ? `<div class="chat-badge-hub" style="margin-top:0">${unreadDirect}</div>` : ''}</div></div></div>`
            };

            let allRows = [directData];

            try {
                const sSnap = await db.collection('chat_sessions').where('participants', 'array-contains', currentUser.emp_no).get();
                const p2ps = await Promise.all(sSnap.docs.map(async doc => {
                    const d = doc.data();
                    const sid = doc.id;
                    if(sid.startsWith('report_') || sid.startsWith('direct_')) return null;
                    const otherID = d.participants.find(p=>p!==currentUser.emp_no);
                    const unread = unreadChats[sid] || 0;
                    let targetName = "Employee #"+otherID;
                    try {
                        const empSnap = await db.collection('employees').doc(otherID).get();
                        if(empSnap.exists) targetName = empSnap.data().name_en || empSnap.data().name_ar || targetName;
                    }catch(e){}
                    const time = new Date(d.updated_at).getTime();
                    return { time: time, html: `<div class="chat-hub-row" onclick="openPrivateChat('${otherID}', '${targetName.replace(/'/g,"\\\\'")}')"><div class="row-icon-cell"><div class="row-icon-circ"><i class="fas fa-user"></i></div></div><div class="row-main"><div class="row-header"><span class="row-title">${targetName}</span><span class="row-date">${time ? new Date(time).toLocaleDateString('en-GB') : ''}</span></div><div style="display:flex; justify-content:space-between; align-items:flex-start"><div class="row-subtext">${d.last_message||''}</div>${unread > 0 ? `<div class="chat-badge-hub">${unread}</div>` : ''}</div></div></div>` };
                }));
                allRows = allRows.concat(p2ps.filter(p=>p!==null));
            } catch(e){}

            const reportRows = await Promise.all(reports.filter(r => (r.status || '').toLowerCase() !== 'done').map(async r => {
                const sid = `report_${r.id}`;
                const unread = unreadChats[sid] || 0;
                let d = new Date(r.created_at);
                let title = `CASE #${r.id.substring(0,5)}`;
                let latestText = r.description || '';
                let rTime = d.getTime();
                try {
                    const hSnap = await db.collection('chat_messages').where('session_id', '==', sid).orderBy('created_at', 'desc').limit(1).get();
                    if(!hSnap.empty) {
                        const m = hSnap.docs[0].data();
                        let prefix = 'Me: ';
                        if(m.role === 'admin') prefix = 'Admin: ';
                        else if(m.role === 'assistant') prefix = 'Assistant: ';
                        else if(m.sender_no !== currentUser.emp_no) prefix = (m.sender_name || 'Employee') + ': ';
                        latestText = prefix + (m.content || m.message || ''); rTime = new Date(m.created_at).getTime();
                    }
                } catch(e){}
                return { time: rTime, html: `<div class="chat-hub-row" onclick="openReportChat('${r.id}', 'chat-list')"><div class="row-icon-cell"><div class="row-icon-circ"><i class="fas fa-comment-dots"></i></div></div><div class="row-main"><div class="row-header"><span class="row-title">${title}</span><span class="row-date">${new Date(rTime).toLocaleDateString('en-GB')}</span></div><div style="display:flex; justify-content:space-between; align-items:flex-start"><div class="row-subtext">${latestText.substring(0, 80)}</div>${unread > 0 ? `<div class="chat-badge-hub">${unread}</div>` : ''}</div></div></div>` };
            }));
            allRows = allRows.concat(reportRows);
            allRows.sort((a, b) => b.time - a.time);
            container.innerHTML = allRows.map(r => r.html).join('');
        }

        async function openDirectChat() {
            lastScreen = 'chat-list';
            activeRoom = 'admin';
            isDirectMode = true;
            markChatRead(`direct_${currentUser.emp_no}`);

            document.getElementById('chat-input-area').style.display = 'flex';
            document.getElementById('chat-lock-area').style.display = 'none';
            document.getElementById('chat-title').innerText = "CIT MANAGEMENT";
            document.getElementById('chat-msgs').innerHTML = '<p style="text-align:center; padding:20px; opacity:0.5; font-weight:900">Syncing with Management...</p>';
            switchScreen('chat');

            try {
                const snap = await db.collection('chat_messages').where('session_id', '==', `direct_${currentUser.emp_no}`).orderBy('created_at', 'asc').get();
                document.getElementById('chat-msgs').innerHTML = snap.docs.map(m => renderMsg(m.data())).join('');
                const c = document.getElementById('chat-msgs'); c.scrollTop = c.scrollHeight;
            } catch (e) { }
        }

        async function openReportChat(rid, from = 'detail') {
            lastScreen = from;
            activeRoom = String(rid);
            isDirectMode = false;

            const rData = reports.find(r => r.id == rid);
            const isClosed = rData && (rData.status || '').toLowerCase() === 'done';

            document.getElementById('chat-input-area').style.display = isClosed ? 'none' : 'flex';
            document.getElementById('chat-lock-area').style.display = isClosed ? 'flex' : 'none';
            document.getElementById('chat-title').innerText = "CHAT #" + String(rid).substring(0,5);
            
            switchScreen('chat');
            markChatRead(`report_${rid}`);
            initChatWS(`report_${rid}`);
            
            try {
                const snap = await db.collection('chat_messages').where('session_id', '==', `report_${rid}`).orderBy('created_at', 'asc').get();
                document.getElementById('chat-msgs').innerHTML = snap.docs.map(m => renderMsg(m.data())).join('');
                const c = document.getElementById('chat-msgs'); c.scrollTop = c.scrollHeight;
            } catch (e) { }
        }

        function initChatWS(sid) {
            if (unsubChat) unsubChat();
            unsubChat = db.collection('chat_messages').where('session_id', '==', sid).where('created_at', '>', new Date().toISOString()).onSnapshot(snap => {
                snap.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const d = change.doc.data();
                        if (d.sender_no !== currentUser.emp_no) appendMsg(d);
                    }
                });
            });
        }

        function appendMsg(m) { const c = document.getElementById('chat-msgs'); c.innerHTML += renderMsg(m); c.scrollTop = c.scrollHeight; }
        
        function renderMsg(m) {
            let isMe = false;
            if (m.sender_no && m.sender_no !== 'Unknown' && m.sender_no !== 'admin') {
                isMe = (m.sender_no === currentUser.emp_no);
            } else {
                isMe = (m.role === 'employee' || m.role === 'user');
            }
            let sName = m.sender_name;
            if (!sName || sName === 'Unknown') {
                if (isP2P && targetPeer) sName = targetPeer.name;
                else sName = (m.role === 'admin' ? 'ADMIN' : 'Colleague');
            }
            const senderDisp = isMe ? 'YOU' : sName;
            return `<div class="chat-bubble ${isMe ? 'me' : 'them'}"><div class="chat-meta">${senderDisp.toUpperCase()}</div><div>${m.content || m.message || ''}</div></div>`;
        }

        async function sendReportMsg() {
            const i = document.getElementById('chat-input'), msg = i.value.trim();
            if (!msg) return;

            const myName = currentUser.name_en || currentUser.name_ar || currentUser.name || "Employee";
            let participants = [];
            let sid = '';

            if (isDirectMode) {
                participants = [currentUser.emp_no, 'admin'];
                sid = `direct_${currentUser.emp_no}`;
            } else if (isP2P) {
                participants = [currentUser.emp_no, targetPeer.emp_no];
                sid = activeRoom;
            } else {
                participants = [currentUser.emp_no, 'admin']; 
                sid = `report_${activeRoom}`;
            }

            const ts = new Date().toISOString();
            const d = { 
                message: msg, content: msg, role: 'employee', sender_name: myName, sender_no: currentUser.emp_no, 
                session_id: sid, participants: participants, is_read: false, created_at: ts 
            };
            
            appendMsg(d);
            i.value = '';

            try {
                await db.collection('chat_messages').add(d);
                if(isP2P) {
                    await db.collection('chat_sessions').doc(sid).set({
                        participants: participants, updated_at: ts, last_message: `${myName}: ${msg}`.substring(0, 50)
                    }, {merge: true});
                }
            } catch(e) { }
        }

        function closeChat() {
            if (unsubChat) { unsubChat(); unsubChat = null; }
            switchScreen(lastScreen === 'chat-list' ? 'chat-list' : 'detail');
        }

        function showToast(m) { const t = document.getElementById('notif-toast'); document.getElementById('toast-msg').innerText = m; t.classList.add('active'); setTimeout(() => t.classList.remove('active'), 4000); }
        function openDrawer() { document.getElementById('drawer').classList.add('active'); document.getElementById('drawer-overlay').classList.add('active'); }
        function closeDrawer() { document.getElementById('drawer').classList.remove('active'); document.getElementById('drawer-overlay').classList.remove('active'); }
        
        window.onload = initApp;"""

    match = re.search(r'const API = window\\.location\\.origin.*?window\\.onload = initApp;', content, re.DOTALL | re.IGNORECASE)
    if match:
        old_part = match.group(0)
        # We need to inject the firebase logic at the top if it is not there
        # but for safety, the python script just replaces the bottom logic first
        new_file = content.replace(old_part, new_js)
        
        # Inject Firebase SDKs if missing
        if "firebase-app.js" not in new_file:
            firebase_injection = \"\"\"
    <!-- Firebase Scripts -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyCavTcaDYVcW_lfF0YwvmnUCZH_PcuwFck",
            authDomain: "cloude-code1.firebaseapp.com",
            projectId: "cloude-code1",
            storageBucket: "cloude-code1.firebasestorage.app",
            messagingSenderId: "553630040386",
            appId: "1:553630040386:web:361da3353836ac709188db",
            measurementId: "G-GJ65XRZ57B"
        };
        if(!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
            \"\"\"
            new_file = new_file.replace('<script>', firebase_injection, 1)

        with open('Mobile App.html', 'w', encoding='utf-8') as f:
            f.write(new_file)
        print("Success Mobile")
    else:
        print("Not Found")
        
try:
    migrate()
except Exception as e:
    print(e)
