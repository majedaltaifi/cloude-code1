        async function renderChatHub() {
            const container = document.getElementById('chat-report-list');
            const circles = document.getElementById('active-peers');
            if (!container || !circles) return;
            circles.innerHTML = `<div class="peer-node" onclick="openDirectChat()"><div class="peer-circ" style="border-color:#e2e8f0"><div class="icon-placeholder" style="background:#f1f5f9; color:var(--primary)"><i class="fas fa-headset"></i></div></div><span class="peer-name-mini">Admin</span></div>`;

            try {
                const sSnap = await db.collection('chat_sessions').where('participants', 'array-contains', currentUser.emp_no).get();
                const allSessions = await Promise.all(sSnap.docs.map(async doc => {
                    const sid = doc.id;
                    const d = doc.data();
                    const unread = unreadChats[sid] || 0;
                    const time = new Date(d.updated_at || d.created_at || new Date()).getTime();
                    
                    if (sid.startsWith('direct_')) {
                        return { time, html: `<div class="chat-hub-row" onclick="openDirectChat()" style="background:#e0f2fe; border-radius:24px; margin-bottom:15px; border:1px solid #bae6fd; padding:18px"><div class="row-icon-cell"><div class="row-icon-circ" style="background:var(--primary); color:white; width:46px; height:46px;"><i class="fas fa-user-shield"></i></div></div><div class="row-main" style="padding-left:10px"><div class="row-header"><span class="row-title" style="font-size:15px">Management Support</span><span class="row-date" style="color:var(--accent)">${time ? new Date(time).toLocaleDateString('en-GB') : ''}</span></div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px"><div class="row-subtext" style="color:#64748b; font-size:13px; font-weight:900">${d.last_message || 'Direct communication...'}</div>${unreadDirect > 0 ? `<div class="chat-badge-hub" style="margin-top:0">${unreadDirect}</div>` : ''}</div></div></div>` };
                    } else if (sid.startsWith('p2p_')) {
                        const otherID = d.participants.find(p => p !== currentUser.emp_no);
                        if(!otherID) return null;
                        let targetName = "Employee #" + otherID;
                        try {
                            const empSnap = await db.collection('employees').doc(otherID).get();
                            if(empSnap.exists) targetName = empSnap.data().name_en || empSnap.data().name_ar || targetName;
                        } catch(e) {}
                        return { time, html: `<div class="chat-hub-row" onclick="openPrivateChat('${otherID}', '${targetName.replace(/'/g,"\\'")}')"><div class="row-icon-cell"><div class="row-icon-circ"><i class="fas fa-user"></i></div></div><div class="row-main"><div class="row-header"><span class="row-title">${targetName}</span><span class="row-date">${time ? new Date(time).toLocaleDateString('en-GB') : ''}</span></div><div style="display:flex; justify-content:space-between; align-items:flex-start"><div class="row-subtext">${d.last_message || ''}</div>${unread > 0 ? `<div class="chat-badge-hub">${unread}</div>` : ''}</div></div></div>` };
                    } else if (sid.startsWith('report_')) {
                        const rid = sid.replace('report_', '');
                        const rData = reports.find(r => String(r.id) === rid);
                        if (!rData || (rData.status || '').toLowerCase() === 'done') return null;
                        
                        const hSnap = await db.collection('chat_messages').where('session_id', '==', sid).get();
                        const hasAdmin = hSnap.docs.some(m => m.data().role === 'admin' || m.data().role === 'assistant');
                        const hasUser = hSnap.docs.some(m => m.data().sender_no === currentUser.emp_no);
                        if (!hasAdmin && !hasUser) return null;

                        return { time, html: `<div class="chat-hub-row" onclick="openReportChat('${rid}', 'chat-list')"><div class="row-icon-cell"><div class="row-icon-circ"><i class="fas fa-comment-dots"></i></div></div><div class="row-main"><div class="row-header"><span class="row-title"># CASE ${rid}</span><span class="row-date">${time ? new Date(time).toLocaleDateString('en-GB') : ''}</span></div><div style="display:flex; justify-content:space-between; align-items:flex-start"><div class="row-subtext">${d.last_message || ''}</div>${unread > 0 ? `<div class="chat-badge-hub">${unread}</div>` : ''}</div></div></div>` };
                    }
                    return null;
                }));

                const rows = allSessions.filter(r => r !== null).sort((a,b) => b.time - a.time);
                container.innerHTML = rows.map(r => r.html).join('') || '<p style="text-align:center; padding:40px; opacity:0.5; font-weight:900">No active conversations found</p>';
                
                // If direct message exists but isn't in sessions yet, add it
                const sidDir = `direct_${currentUser.emp_no}`;
                if(!allSessions.some(s => s && s.html.includes('Management Support'))) {
                   const hSnap = await db.collection('chat_messages').where('session_id', '==', sidDir).get();
                   if(!hSnap.empty) {
                       const msgs = hSnap.docs.map(doc => doc.data()).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
                       const m = msgs[0];
                       const time = new Date(m.created_at).getTime();
                       const unread = unreadChats[sidDir] || 0;
                       const rowHTML = `<div class="chat-hub-row" onclick="openDirectChat()" style="background:#e0f2fe; border-radius:24px; margin-bottom:15px; border:1px solid #bae6fd; padding:18px"><div class="row-icon-cell"><div class="row-icon-circ" style="background:var(--primary); color:white; width:46px; height:46px;"><i class="fas fa-user-shield"></i></div></div><div class="row-main" style="padding-left:10px"><div class="row-header"><span class="row-title" style="font-size:15px">Management Support</span><span class="row-date">${new Date(time).toLocaleDateString('en-GB')}</span></div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px"><div class="row-subtext" style="color:#64748b; font-size:13px; font-weight:900">${m.content || m.message || ''}</div>${unread > 0 ? `<div class="chat-badge-hub" style="margin-top:0">${unread}</div>` : ''}</div></div></div>`;
                       container.innerHTML = rowHTML + container.innerHTML;
                   }
                }
            } catch (e) { console.error("Chat hub render error:", e); }
        }
