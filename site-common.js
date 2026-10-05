/*!
 * site-common.js — 共通パーツ（メニュー / フッター / ファビコン）
 * ------------------------------------------------------------
 * 使い方：各ツールのHTMLの <head> に下の2行を足すだけ。
 *   <link rel="stylesheet" href="site-common.css">
 *   <script src="site-common.js" defer></script>
 *
 * 文言・メニュー項目は下の SITE_COMMON だけ編集すればOK。
 * 全ツールで同じ site-common.js を読み込めば、メニューやフッターを一括更新できます。
 * React/Babelに依存しない素のJSなので、どんなページでも動きます。
 *
 * 【ページごとの設定（任意）】<body> に data 属性を付けると上書きできます。
 *   data-site-current="tool2.html"   … 「表示中」にする項目のurl（省略時は現在のファイル名で自動判定）
 *   data-site-menu="off"             … メニューを出さない
 *   data-site-footer="off"           … フッターを出さない
 */
(function () {
  'use strict';

  // ===== ここを編集 ==========================================
  const SITE_COMMON = {
    favicon: 'NAPOfavicon.png',        // ファビコン画像のパス（ページからの相対パス）

    siteMenu: {
      title: '他のツール',
      // url が空('')の項目は「準備中」。newTab:true で別タブ。
      items: [
        { name: '連盟ダイヤ推定ツール', url: 'https://va-naporilab.github.io/alliancegems/' },
        { name: 'ナポリ探究所 - ツール集', url: 'https://sites.google.com/view/naporilab/tools' }
        // 例: { name: '○○ツール', url: 'https://ユーザー名.github.io/リポジトリ名/', newTab: true },
      ]
    },

    footerInfo: {
      notice: '本ツール内での計算は、考察に基づく推定であり、ゲーム内の事象を正確にとらえているとは限りません。',
      contactLead: '質問・ご連絡・バグの報告は',
      contacts: [
        { label: 'X', id: 'naporitan1_3531', url: 'https://x.com/naporitan1_3531' },
        { label: 'Discord', id: 'naporitan1sei_05103' }   // urlなし＝テキスト表示
      ],
      contactTail: 'までお願いします。',
      credits: [
        '本ツールは個人が制作した非公式のシミュレーターであり、ビビッドアーミー／TopWar公式とは一切関係ありません。',
        'ゲームデータの著作権は、G123ないしはRivergameに帰属します。'
      ],
      copyright: '© 2026 ナポリタン1世（Napo）'
    }
  };
  // ===========================================================

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach(c => node.append(c));
    return node;
  };

  // ---- ファビコン ----
  function setupFavicon() {
    if (!SITE_COMMON.favicon) return;
    document.querySelectorAll('link[rel~="icon"]').forEach(n => n.remove());
    document.head.append(el('link', { rel: 'icon', href: SITE_COMMON.favicon, type: 'image/png' }));
  }

  // ---- メニュー ----
  function currentFile() {
    const explicit = document.body.dataset.siteCurrent;
    if (explicit) return explicit;
    return location.pathname.split('/').pop() || 'index.html';
  }

  function setupMenu() {
    const cfg = SITE_COMMON.siteMenu;
    if (document.body.dataset.siteMenu === 'off') return;
    if (!cfg || !cfg.items || cfg.items.length === 0) return;

    const here = currentFile();
    const wrap = el('div', { class: 'site-menu' });
    const btn = el('button', { class: 'site-menu-btn', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' }, [
      el('span', { class: 'site-menu-icon', 'aria-hidden': 'true', text: '☰' }),
      el('span', { class: 'site-menu-btn-label', text: 'メニュー' })
    ]);
    const panel = el('div', { class: 'site-menu-panel', role: 'menu', hidden: '' });
    panel.append(el('div', { class: 'site-menu-title', text: cfg.title || '' }));

    cfg.items.forEach(item => {
      const isCurrent = item.current || (item.url && item.url === here);
      if (isCurrent) {
        panel.append(el('div', { class: 'site-menu-item current', role: 'menuitem', 'aria-current': 'page' }, [
          item.name, el('span', { class: 'site-menu-tag', text: '表示中' })
        ]));
      } else if (!item.url) {
        panel.append(el('div', { class: 'site-menu-item disabled', role: 'menuitem' }, [
          item.name, el('span', { class: 'site-menu-tag', text: '準備中' })
        ]));
      } else {
        const a = el('a', { class: 'site-menu-item', role: 'menuitem', href: item.url }, [item.name]);
        if (item.newTab) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.append(el('span', { class: 'site-menu-tag', text: '↗' }));
        }
        panel.append(a);
      }
    });

    const setOpen = (open) => {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => setOpen(panel.hidden));
    const outside = (e) => { if (!wrap.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', outside);
    document.addEventListener('touchstart', outside);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    wrap.append(btn, panel);
    document.body.append(wrap);
  }

  // ---- フッター（注意書き・連絡先・クレジット・コピーライト） ----
  function setupFooter() {
    const f = SITE_COMMON.footerInfo;
    if (document.body.dataset.siteFooter === 'off' || !f) return;

    const footer = el('footer', { class: 'site-footer' });
    if (f.notice) footer.append(el('p', { class: 'footer-notice', text: f.notice }));

    if (f.contacts && f.contacts.length) {
      const p = el('p');
      p.append((f.contactLead || '') + ' ');
      f.contacts.forEach((ct, i) => {
        if (i > 0) p.append(' または ');
        const label = ct.label + '（' + ct.id + '）';
        if (ct.url) p.append(el('a', { href: ct.url, target: '_blank', rel: 'noopener noreferrer', text: label }));
        else p.append(el('span', { text: label }));
      });
      p.append(f.contactTail || '');
      footer.append(p);
    }
    (f.credits || []).forEach(t => footer.append(el('p', { text: t })));
    if (f.copyright) footer.append(el('p', { class: 'footer-copyright', text: f.copyright }));

    const box = el('div', { class: 'site-footer-wrap' }, [footer]);
    document.body.append(box);
  }

  // faviconは即時、DOMが必要なものは読み込み後に実行
  const init = () => { setupFavicon(); setupMenu(); setupFooter(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
