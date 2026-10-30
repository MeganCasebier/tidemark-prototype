/* Tidemark: a working prototype for a company that doesn't exist.
   Everything here is fictional fixture data: the lender, the borrowers, the loans and the amounts.
   It renders into #tm and needs nothing else. */
(function () {
    var root = document.getElementById('tm');
    if (!root) return;

    var STATES = [
        { id: 'open', label: 'Open' },
        { id: 'borrower', label: 'Waiting on borrower' },
        { id: 'short', label: 'Short-paid' },
        { id: 'resolved', label: 'Resolved' }
    ];
    var NEXT = {
        open: { label: 'Contact the borrower', to: 'borrower', done: 'Reminder sent. Waiting on the borrower.' },
        borrower: { label: 'Record a partial payment', to: 'short', done: 'Partial payment recorded. Now short-paid.' },
        short: { label: 'Settle the difference', to: 'resolved', done: 'Settled. Moved to resolved.' }
    };
    var data = [
        { id: 'TL-20417', biz: 'Juniper Street Bakery', due: 4180, state: 'short', attempts: [['Oct 1', 4180, 'Returned: insufficient funds'], ['Oct 6', 3100, 'Received']] },
        { id: 'TL-20388', biz: 'Okafor Mechanical', due: 2950, state: 'open', attempts: [['Oct 3', 2950, 'Returned: account closed']] },
        { id: 'TL-20502', biz: 'Lantern Dental Group', due: 7620, state: 'borrower', attempts: [['Oct 2', 7620, 'Returned: insufficient funds'], ['Oct 9', 7620, 'Returned: insufficient funds']] },
        { id: 'TL-20311', biz: 'Halvorsen Marine Supply', due: 5410, state: 'open', attempts: [['Oct 8', 5410, 'Returned: payment stopped']] },
        { id: 'TL-20466', biz: 'Pinecrest Childcare', due: 1890, state: 'short', attempts: [['Oct 4', 1200, 'Received']] },
        { id: 'TL-20290', biz: 'Two Rivers Print Co.', due: 3340, state: 'resolved', attempts: [['Sep 30', 3340, 'Returned: insufficient funds'], ['Oct 7', 3340, 'Received']] }
    ];

    var ui = { tab: 'all', sel: 'TL-20417', owner: null, notes: false };
    var money = function (n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    var received = function (d) { return d.attempts.reduce(function (s, a) { return s + (a[2] === 'Received' ? a[1] : 0); }, 0); };
    var stateLabel = function (id) { for (var i = 0; i < STATES.length; i++) if (STATES[i].id === id) return STATES[i].label; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var note = function (n) { return ui.notes ? '<span class="tm-pin" aria-hidden="true">' + n + '</span>' : ''; };

    function render() {
        var rows = data.filter(function (d) { return ui.tab === 'all' || d.state === ui.tab; });
        if (!rows.some(function (d) { return d.id === ui.sel; })) ui.sel = rows.length ? rows[0].id : null;
        var sel = data.filter(function (d) { return d.id === ui.sel; })[0];
        var count = function (id) { return data.filter(function (d) { return id === 'all' || d.state === id; }).length; };

        var h = '';
        h += '<div class="tm-bar"><span class="tm-logo">Tidemark</span><span class="tm-nav"><span>Loans</span><span class="is-on">Payment exceptions</span><span>Borrowers</span></span>';
        h += '<button type="button" class="tm-notes-btn" aria-pressed="' + ui.notes + '">' + (ui.notes ? 'Hide' : 'Show') + ' the design notes</button></div>';

        // The decision that kept the screen stuck.
        if (!ui.owner) {
            h += '<div class="tm-decide">' + note(4) + '<p><strong>Who resolves a short-paid loan?</strong> Nobody owns this yet, so nothing below can move.</p>';
            h += '<span class="tm-decide-btns"><button type="button" data-owner="Servicing">Servicing team</button><button type="button" data-owner="Account manager">Account manager</button></span></div>';
        } else {
            h += '<div class="tm-decide is-made">' + note(4) + '<p><strong>Decided:</strong> the ' + (ui.owner === 'Servicing' ? 'servicing team' : 'account manager') + ' resolves short-paid loans.</p><button type="button" class="tm-link" data-owner="">Undo</button></div>';
        }
        if (ui.notes) h += '<ol class="tm-notes"><li><b>1</b> One row per loan in trouble, every payment attempt under it. Servicing thinks in loans, not transactions.</li><li><b>2</b> Four states, derived from the payments. Nobody sets them by hand.</li><li><b>3</b> One button that knows the next step. When there&rsquo;s nothing to do, there&rsquo;s no button.</li><li><b>4</b> The decision that kept this screen in review for a month. Made in the room, in thirty minutes, with the prototype on screen.</li></ol>';

        h += '<div class="tm-tabs" role="group" aria-label="Filter by state">' + note(2);
        [{ id: 'all', label: 'All' }].concat(STATES).forEach(function (s) {
            h += '<button type="button" data-tab="' + s.id + '" aria-pressed="' + (ui.tab === s.id) + '">' + s.label + ' <span>' + count(s.id) + '</span></button>';
        });
        h += '</div>';

        h += '<div class="tm-body"><ul class="tm-list" aria-label="Loans with payment exceptions">';
        rows.forEach(function (d) {
            var short = d.due - received(d);
            h += '<li><button type="button" data-sel="' + d.id + '" aria-pressed="' + (d.id === ui.sel) + '">';
            h += '<span class="tm-biz">' + (d === rows[0] ? note(1) : '') + esc(d.biz) + '</span><span class="tm-id">' + d.id + ' &middot; ' + d.attempts.length + ' attempt' + (d.attempts.length > 1 ? 's' : '') + '</span>';
            h += '<span class="tm-state is-' + d.state + '">' + stateLabel(d.state) + '</span>';
            h += '<span class="tm-amt">' + (d.state === 'resolved' ? 'Paid' : money(short) + ' short') + '</span>';
            h += '<span class="tm-owner' + (ui.owner || d.state === 'resolved' ? '' : ' is-none') + '">' + (d.state === 'resolved' ? 'Done' : ui.owner ? (ui.owner === 'Servicing' ? 'Servicing' : 'Account mgr') : 'Unassigned') + '</span>';
            h += '</button></li>';
        });
        if (!rows.length) h += '<li class="tm-empty">Nothing here. That&rsquo;s the good outcome.</li>';
        h += '</ul>';

        if (sel) {
            var got = received(sel), next = NEXT[sel.state];
            h += '<div class="tm-detail"><p class="tm-detail-id">' + sel.id + '</p><h4>' + esc(sel.biz) + '</h4>';
            h += '<dl><div><dt>Scheduled</dt><dd>' + money(sel.due) + '</dd></div><div><dt>Received</dt><dd>' + money(got) + '</dd></div><div><dt>Short</dt><dd>' + money(sel.state === 'resolved' ? 0 : sel.due - got) + '</dd></div></dl>';
            h += '<p class="tm-sub">Payment attempts</p><ul class="tm-attempts">';
            sel.attempts.forEach(function (a) { h += '<li><span>' + a[0] + '</span><span>' + money(a[1]) + '</span><span class="' + (a[2] === 'Received' ? 'is-ok' : 'is-bad') + '">' + a[2] + '</span></li>'; });
            h += '</ul>';
            if (next) {
                h += '<div class="tm-act">' + note(3) + '<button type="button" class="tm-go" data-go="' + sel.id + '"' + (ui.owner ? '' : ' disabled') + '>' + next.label + '</button>';
                if (!ui.owner) h += '<p class="tm-hint">Decide who owns short-pays first.</p>';
                h += '</div>';
            } else {
                h += '<p class="tm-hint">Resolved. Nothing to do, so there&rsquo;s no button.</p>';
            }
            h += '</div>';
        }
        h += '</div><p class="tm-toast" role="status" aria-live="polite"></p>';
        root.innerHTML = h;
    }

    function toast(msg) {
        var t = root.querySelector('.tm-toast');
        t.textContent = msg; t.classList.add('is-on');
        clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
    }

    root.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-owner')) { ui.owner = b.getAttribute('data-owner') || null; render(); if (ui.owner) toast('Decision recorded. The queue can move now.'); return; }
        if (b.hasAttribute('data-tab')) { ui.tab = b.getAttribute('data-tab'); render(); return; }
        if (b.hasAttribute('data-sel')) { ui.sel = b.getAttribute('data-sel'); render(); if (window.innerWidth < 720) { var dt = root.querySelector('.tm-detail'); if (dt) dt.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } return; }
        if (b.classList.contains('tm-notes-btn')) { ui.notes = !ui.notes; render(); return; }
        if (b.hasAttribute('data-go')) {
            var d = data.filter(function (x) { return x.id === b.getAttribute('data-go'); })[0], n = NEXT[d.state];
            if (d.state === 'borrower') d.attempts.push(['Oct 24', Math.round(d.due * 0.6), 'Received']);
            if (d.state === 'short') d.attempts.push(['Oct 24', d.due - received(d), 'Received']);
            d.state = n.to; ui.sel = d.id;
            if (ui.tab !== 'all') ui.tab = d.state;
            render(); toast(n.done);
        }
    });

    root.classList.add('is-live');
    render();
})();
