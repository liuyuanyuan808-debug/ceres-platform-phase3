(() => {
  'use strict';

  const app = document.querySelector('#app');
  const overlay = document.querySelector('#overlay');
  const dialogMessage = document.querySelector('#dialog-message');
  const toast = document.querySelector('#toast');

  const packages = [
    { id: 'LP-001', name: 'V3 Pro 中文语言包', locale: 'zh-CN', language: '简体中文', version: 'V1.3.0', models: 'V3 Pro', firmware: 'V3.4.0+', size: '428 KB', status: '已发布', updated: '2026-09-09 17:42', note: '更新专家韵律名称及设备提示文案' },
    { id: 'LP-002', name: 'V3 Pro English Pack', locale: 'en-US', language: 'English', version: 'V1.2.1', models: 'V3 Pro', firmware: 'V3.4.0+', size: '412 KB', status: '灰度中', updated: '2026-09-10 09:45', note: 'Fix terminology for expert programs' },
    { id: 'LP-003', name: 'V3 Pro Deutsch Pack', locale: 'de-DE', language: 'Deutsch', version: 'V1.0.0', models: 'V3 Pro', firmware: 'V3.5.0+', size: '436 KB', status: '草稿', updated: '2026-09-10 11:06', note: '德语首版，等待测试设备验证' },
    { id: 'LP-014', name: 'Air 2 中文语言包', locale: 'zh-CN', language: '简体中文', version: 'V1.1.0', models: 'Air 2', firmware: 'V2.8.0+', size: '405 KB', status: '已停止', updated: '2026-08-28 09:30', note: '历史版本，已由 V1.1.1 替代' }
  ];

  const releases = [
    { id: 'REL-1028', packageId: 'LP-001', package: 'V3 Pro 中文语言包', version: 'V1.3.0', target: 'V3 Pro · 全部渠道 · 全部设备', mode: '全量', status: '发布中', operator: '陈剑泽', time: '2026-09-09 18:10' },
    { id: 'REL-1029', packageId: 'LP-002', package: 'V3 Pro English Pack', version: 'V1.2.1', target: 'V3 Pro · Amazon US · 20% 设备', mode: '灰度 20%', status: '发布中', operator: '刘媛媛', time: '2026-09-10 09:45' },
    { id: 'REL-1030', packageId: 'LP-003', package: 'V3 Pro Deutsch Pack', version: 'V1.0.0', target: 'V3 Pro · EU · 12 台白名单', mode: '白名单', status: '验证中', operator: '刘媛媛', time: '2026-09-10 11:06' },
    { id: 'REL-0993', packageId: 'LP-002', package: 'V3 Pro English Pack', version: 'V1.2.0', target: 'V3 Pro · 全部渠道 · 全部设备', mode: '全量', status: '已停止', operator: '池浩', time: '2026-09-07 20:12' }
  ];

  const updates = [
    { id: 'TASK-4821', device: 'V3P-A8F214', locale: 'zh-CN', change: 'V1.2.0 → V1.3.0', result: '更新成功', duration: '18.6 s', time: '2026-09-10 14:26', error: '-' },
    { id: 'TASK-4817', device: 'V3P-B19C02', locale: 'en-US', change: 'V1.2.0 → V1.2.1', result: '写入失败', duration: '17.9 s', time: '2026-09-10 14:22', error: 'DEVICE_WRITE_FAILED' },
    { id: 'TASK-4809', device: 'V3P-71AC30', locale: 'en-US', change: 'V1.2.0 → V1.2.1', result: '下载失败', duration: '8.0 s', time: '2026-09-10 14:18', error: 'PACKAGE_DOWNLOAD_TIMEOUT' },
    { id: 'TASK-4795', device: 'V3P-33E911', locale: 'zh-CN', change: 'V1.3.0', result: '无需更新', duration: '0.3 s', time: '2026-09-10 14:02', error: 'no_update' }
  ];

  const nav = {
    packages: ['语言包管理', '统一管理语言包及版本'],
    releases: ['发布记录', '查看发布范围与状态'],
    updates: ['更新记录', '查看设备更新结果']
  };
  const initial = nav[location.hash.slice(1)] ? location.hash.slice(1) : 'packages';
  const state = { section: initial, query: '', filter: '全部', layer: null, selected: null, pending: null };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function statusTag(status) {
    const types = {
      已发布: 'success', 发布中: 'success', 更新成功: 'success',
      灰度中: 'primary', 验证中: 'primary',
      草稿: 'warning', 已停止: 'info', 无需更新: 'info',
      下载失败: 'danger', 写入失败: 'danger'
    };
    return `<span class="tag tag--small tag--${types[status] || 'info'}">${status}</span>`;
  }

  function sidebar() {
    const links = Object.entries(nav).map(([key, value]) =>
      `<a class="sidebar-menu__child${state.section === key ? ' is-active' : ''}" href="#${key}" data-nav="${key}">
        <span class="sidebar-menu__label">${value[0]}</span>
      </a>`
    ).join('');
    return `<aside class="sidebar">
      <div class="brand-row"><div class="brand-logo">C</div><div class="brand"><strong>Ceres平台三期</strong></div></div>
      <nav class="sidebar-menu">
        <button class="sidebar-menu__parent is-active" type="button"><span class="sidebar-menu__label">多语言包</span></button>
        <div class="sidebar-menu__children">${links}</div>
        <div class="phase3-nav-note">简化版流程<br>上传 → 发布 → 查看结果</div>
        <a class="sidebar-menu__parent" href="https://liuyuanyuan808-debug.github.io/ceres-platform/#mode-units">
          <span class="sidebar-menu__label">返回原平台</span>
        </a>
      </nav>
      <div class="user-footer"><div class="user-card">
        <img class="avatar-image" src="./assets/ceres-avatar.png" alt="">
        <div class="user-card__info"><span>当前登录</span><strong>刘媛媛</strong></div>
      </div></div>
    </aside>`;
  }

  function shell(body, action = '') {
    const [title, subtitle] = nav[state.section];
    return `<div class="admin-shell">${sidebar()}<main class="content-shell"><section class="page-stack">
      <header class="page-header-bar">
        <div><h1>${title}</h1><p class="section-subheading">${subtitle}</p></div>
        <div class="page-header-actions">${action}</div>
      </header>
      <div class="list-page-body">${body}</div>
    </section></main></div>`;
  }

  function toolbar(placeholder, options) {
    return `<section class="filter-toolbar phase3-toolbar">
      <input class="control" id="query" value="${escapeHtml(state.query)}" placeholder="${placeholder}">
      <div class="select-wrap"><select class="control" id="filter">
        <option>全部</option>${options.map(option => `<option${state.filter === option ? ' selected' : ''}>${option}</option>`).join('')}
      </select></div>
      <span></span><button class="btn btn--outline" id="reset">重置</button>
    </section>`;
  }

  function table(headers, rows, minWidth = 960) {
    return `<section class="list-table-card"><div class="table-shell"><div class="data-table-scroll-region">
      <table class="data-table" style="min-width:${minWidth}px"><thead><tr>
        ${headers.map(header => `<th>${header}</th>`).join('')}
      </tr></thead><tbody>${rows || `<tr class="empty-row"><td colspan="${headers.length}">暂无符合条件的数据</td></tr>`}</tbody></table>
    </div></div><footer class="pagination-bar"><span>共 ${(rows.match(/<tr/g) || []).length} 条记录</span></footer></section>`;
  }

  function packagesPage() {
    const rows = packages.filter(item =>
      (state.filter === '全部' || item.status === state.filter) &&
      [item.name, item.locale, item.models, item.version].join(' ').toLowerCase().includes(state.query.toLowerCase())
    ).map(item => `<tr>
      <td><strong>${item.name}</strong><small>${item.id}</small></td>
      <td>${item.language}<small>${item.locale}</small></td>
      <td><strong>${item.version}</strong></td><td>${item.models}</td><td>${item.size}</td>
      <td>${statusTag(item.status)}</td><td>${item.updated}</td>
      <td class="actions">
        <button data-detail="${item.id}">查看</button>
        <button data-version="${item.id}">新建版本</button>
        <button data-publish="${item.id}">发布</button>
      </td>
    </tr>`).join('');
    return shell(
      `<div class="info-banner"><strong>简单流程</strong><span>上传语言包后保存为草稿；验证无误后直接从列表发起发布。兼容范围和设备范围在发布时一次配置。</span></div>
      ${toolbar('搜索语言包名称、语种、机型或版本', ['草稿', '验证中', '灰度中', '已发布', '已停止'])}
      ${table(['语言包', '语种', '当前版本', '适用机型', '大小', '状态', '更新时间', '操作'], rows, 1080)}`,
      '<button class="btn btn--primary" id="upload">上传语言包</button>'
    );
  }

  function releasesPage() {
    const rows = releases.filter(item =>
      (state.filter === '全部' || item.status === state.filter) &&
      [item.id, item.package, item.target].join(' ').toLowerCase().includes(state.query.toLowerCase())
    ).map(item => `<tr>
      <td><strong>${item.package}</strong><small>${item.id}</small></td><td>${item.version}</td>
      <td><span class="cell-text" title="${item.target}">${item.target}</span></td><td>${item.mode}</td>
      <td>${statusTag(item.status)}</td><td>${item.operator}</td><td>${item.time}</td>
      <td class="actions"><button data-release="${item.id}">查看</button>
        ${item.status !== '已停止' ? `<button class="danger" data-stop="${item.id}">停止</button>` : ''}
      </td>
    </tr>`).join('');
    return shell(
      `${toolbar('搜索语言包、发布单号或发布范围', ['验证中', '发布中', '已停止'])}
      ${table(['语言包', '版本', '发布范围', '发布方式', '状态', '操作人', '发布时间', '操作'], rows, 1140)}`
    );
  }

  function updatesPage() {
    const rows = updates.filter(item =>
      (state.filter === '全部' || item.result === state.filter) &&
      [item.id, item.device, item.locale, item.error].join(' ').toLowerCase().includes(state.query.toLowerCase())
    ).map(item => `<tr>
      <td><strong>${item.id}</strong></td><td>${item.device}</td><td>${item.locale}</td>
      <td>${item.change}</td><td>${statusTag(item.result)}</td><td>${item.duration}</td><td>${item.time}</td>
      <td class="actions"><button data-update="${item.id}">查看</button></td>
    </tr>`).join('');
    return shell(
      `<section class="kpi-strip">
        <div class="kpi-item"><span>今日检查</span><strong>1,284</strong><small>设备请求</small></div>
        <div class="kpi-item"><span>需要更新</span><strong>726</strong><small>命中率 56.5%</small></div>
        <div class="kpi-item"><span>更新成功</span><strong>668</strong><small>成功率 92.0%</small></div>
        <div class="kpi-item"><span>更新失败</span><strong>18</strong><small>可查看失败环节</small></div>
      </section>
      ${toolbar('搜索任务 ID、设备 SN 或错误码', ['无需更新', '更新成功', '下载失败', '写入失败'])}
      ${table(['任务 ID', '设备 SN', '语种', '版本变化', '结果', '耗时', '检查时间', '操作'], rows, 1030)}`
    );
  }

  function render() {
    app.innerHTML = state.section === 'packages' ? packagesPage() :
      state.section === 'releases' ? releasesPage() : updatesPage();
    bindPage();
    renderLayer();
  }

  const field = (label, id, value = '', wide = false) => `<label class="${wide ? 'full' : ''}">
    <span class="field-label">${label}</span><input class="control" id="${id}" value="${escapeHtml(value)}">
  </label>`;
  const selectField = (label, id, values, selected) => `<label><span class="field-label">${label}</span>
    <div class="select-wrap"><select class="control" id="${id}">
      ${values.map(value => `<option${value === selected ? ' selected' : ''}>${value}</option>`).join('')}
    </select></div>
  </label>`;

  function modal(title, subtitle, body, confirmText) {
    return `<div class="modal-backdrop" data-backdrop><section class="phase3-modal">
      <header><div><h2>${title}</h2><p>${subtitle}</p></div><button class="dialog-close" data-close>×</button></header>
      <div class="phase3-modal__body">${body}</div>
      <footer><button class="btn btn--outline" data-close>取消</button><button class="btn btn--primary" id="confirm-layer">${confirmText}</button></footer>
    </section></div>`;
  }

  function drawer(title, subtitle, body, footer = '') {
    return `<div class="drawer-backdrop" data-backdrop><aside class="drawer">
      <header><div><h2>${title}</h2><p>${subtitle}</p></div><button class="dialog-close" data-close>×</button></header>
      <div class="drawer__body">${body}</div>${footer ? `<div class="drawer__footer">${footer}</div>` : ''}
    </aside></div>`;
  }

  function uploadForm(item) {
    return `<div class="phase3-form">
      <div class="full"><span class="field-label">语言包文件 *</span><label class="file-drop">
        <input id="package-file" type="file" accept=".bin,.zip" hidden>
        <span id="file-name">点击选择 .bin / .zip 文件（不超过 5 MB）</span>
      </label></div>
      ${field('语言包名称 *', 'package-name', item?.name || '')}
      ${field('版本号 *', 'package-version', item ? 'V1.3.1' : 'V1.0.0')}
      ${selectField('语种 *', 'package-locale', ['zh-CN', 'en-US', 'de-DE'], item?.locale || 'zh-CN')}
      ${selectField('适用机型 *', 'package-model', ['V3 Pro', 'Air 2', '全部机型'], item?.models || 'V3 Pro')}
      <label class="full"><span class="field-label">版本说明 *</span><textarea class="control" id="package-note" placeholder="简要说明本次更新内容"></textarea></label>
      <p class="validation-error full" id="form-error"></p>
    </div>`;
  }

  function publishForm(item) {
    return `<div class="phase3-form">
      <div class="change-preview full"><div><span>待发布语言包</span><strong>${item.name}</strong></div><span>→</span><div><span>目标版本</span><strong>${item.version}</strong></div></div>
      ${selectField('发布方式 *', 'release-mode', ['测试白名单', '灰度发布', '全量发布'], item.status === '草稿' ? '测试白名单' : '灰度发布')}
      ${selectField('渠道 *', 'release-channel', ['全部渠道', 'Amazon US', 'EU', '中国大陆'], '全部渠道')}
      ${field('最低固件版本 *', 'release-firmware', item.firmware)}
      ${field('设备范围', 'release-scope', item.status === '草稿' ? '请输入设备 SN，逗号分隔' : '20%')}
      <label class="full"><span class="field-label">发布说明 *</span><textarea class="control" id="release-note" placeholder="说明发布目的及验证重点"></textarea></label>
      <div class="info-banner full"><strong>规则检查</strong><span>当前范围未发现冲突。停止发布只阻止新请求命中，不会恢复已更新设备。</span></div>
      <p class="validation-error full" id="form-error"></p>
    </div>`;
  }

  function renderLayer() {
    document.querySelectorAll('.modal-backdrop,.drawer-backdrop').forEach(node => node.remove());
    let html = '';
    const item = state.selected;
    if (state.layer === 'upload') html = modal('上传语言包', '填写最少必要信息，保存后再配置发布范围', uploadForm(null), '保存草稿');
    if (state.layer === 'version') html = modal('新建版本', `基于 ${item.name} 创建新版本`, uploadForm(item), '保存草稿');
    if (state.layer === 'publish') html = modal('发布语言包', '兼容范围与设备范围在一次操作中完成', publishForm(item), '确认发布');
    if (state.layer === 'package-detail') html = drawer(item.name, item.id,
      `<dl class="detail-grid"><dt>语种</dt><dd>${item.language}（${item.locale}）</dd><dt>当前版本</dt><dd>${item.version}</dd>
      <dt>适用范围</dt><dd>${item.models} · 固件 ${item.firmware}</dd><dt>文件大小</dt><dd>${item.size}</dd>
      <dt>当前状态</dt><dd>${statusTag(item.status)}</dd><dt>版本说明</dt><dd>${item.note}</dd></dl>
      <div class="version-list"><h3>历史版本</h3><table class="data-table"><thead><tr><th>版本</th><th>状态</th><th>更新时间</th></tr></thead>
      <tbody><tr><td>${item.version}</td><td>${statusTag(item.status)}</td><td>${item.updated}</td></tr>
      <tr><td>V1.2.0</td><td>${statusTag('已停止')}</td><td>2026-08-20 16:30</td></tr></tbody></table></div>`,
      `<button class="btn btn--outline" data-version="${item.id}">新建版本</button><button class="btn btn--primary" data-publish="${item.id}">发布</button>`
    );
    if (state.layer === 'release-detail') html = drawer('发布详情', item.id,
      `<dl class="detail-grid"><dt>语言包</dt><dd>${item.package} ${item.version}</dd><dt>发布范围</dt><dd>${item.target}</dd>
      <dt>发布方式</dt><dd>${item.mode}</dd><dt>当前状态</dt><dd>${statusTag(item.status)}</dd>
      <dt>操作人</dt><dd>${item.operator}</dd><dt>发布时间</dt><dd>${item.time}</dd></dl>`
    );
    if (state.layer === 'update-detail') {
      const failedAt = item.result === '下载失败' ? 1 : item.result === '写入失败' ? 4 : -1;
      const steps = ['检查版本', '下载语言包', '蓝牙传输', '设备校验', '覆盖写入'];
      html = drawer('更新详情', item.id,
        `<dl class="detail-grid"><dt>设备 SN</dt><dd>${item.device}</dd><dt>语种</dt><dd>${item.locale}</dd>
        <dt>版本变化</dt><dd>${item.change}</dd><dt>结果</dt><dd>${statusTag(item.result)}</dd>
        <dt>错误码</dt><dd><code>${item.error}</code></dd></dl>
        <div class="version-list"><h3>更新过程</h3><ol class="timeline">${steps.map((step, index) =>
          `<li class="${index === failedAt ? 'is-error' : failedAt >= 0 && index > failedAt ? 'is-pending' : ''}">
            <strong>${step}</strong><span>${index === failedAt ? item.error : failedAt >= 0 && index > failedAt ? '未执行' : '完成'}</span>
          </li>`).join('')}</ol></div>`
      );
    }
    if (html) {
      document.body.insertAdjacentHTML('beforeend', html);
      bindLayer();
    }
  }

  function bindPage() {
    document.querySelectorAll('[data-nav]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); state.section = link.dataset.nav; state.query = ''; state.filter = '全部';
      location.hash = state.section; render();
    }));
    document.querySelector('#query')?.addEventListener('input', event => { state.query = event.target.value; render(); });
    document.querySelector('#filter')?.addEventListener('change', event => { state.filter = event.target.value; render(); });
    document.querySelector('#reset')?.addEventListener('click', () => { state.query = ''; state.filter = '全部'; render(); });
    document.querySelector('#upload')?.addEventListener('click', () => openLayer('upload'));
    document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => openLayer('package-detail', packages.find(item => item.id === button.dataset.detail))));
    document.querySelectorAll('[data-version]').forEach(button => button.addEventListener('click', () => openLayer('version', packages.find(item => item.id === button.dataset.version))));
    document.querySelectorAll('[data-publish]').forEach(button => button.addEventListener('click', () => openLayer('publish', packages.find(item => item.id === button.dataset.publish))));
    document.querySelectorAll('[data-release]').forEach(button => button.addEventListener('click', () => openLayer('release-detail', releases.find(item => item.id === button.dataset.release))));
    document.querySelectorAll('[data-update]').forEach(button => button.addEventListener('click', () => openLayer('update-detail', updates.find(item => item.id === button.dataset.update))));
    document.querySelectorAll('[data-stop]').forEach(button => button.addEventListener('click', () => {
      const release = releases.find(item => item.id === button.dataset.stop);
      showDialog('停止后只阻止新设备命中，不影响已经更新的设备。确认停止发布？', () => {
        release.status = '已停止'; render(); showToast('发布已停止');
      });
    }));
  }

  function openLayer(layer, selected = null) { state.layer = layer; state.selected = selected; renderLayer(); }
  function closeLayer() { state.layer = null; state.selected = null; renderLayer(); }

  function bindLayer() {
    document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeLayer));
    document.querySelectorAll('[data-backdrop]').forEach(backdrop => backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closeLayer();
    }));
    document.querySelectorAll('[data-version]').forEach(button => button.addEventListener('click', () => openLayer('version', packages.find(item => item.id === button.dataset.version))));
    document.querySelectorAll('[data-publish]').forEach(button => button.addEventListener('click', () => openLayer('publish', packages.find(item => item.id === button.dataset.publish))));
    document.querySelector('#package-file')?.addEventListener('change', event => {
      const file = event.target.files[0];
      document.querySelector('#file-name').textContent = file ? `${file.name} · ${Math.ceil(file.size / 1024)} KB` : '点击选择文件';
    });
    document.querySelector('#confirm-layer')?.addEventListener('click', () => {
      if (state.layer === 'upload' || state.layer === 'version') savePackage();
      if (state.layer === 'publish') publishPackage();
    });
  }

  function savePackage() {
    const name = document.querySelector('#package-name').value.trim();
    const version = document.querySelector('#package-version').value.trim();
    const locale = document.querySelector('#package-locale').value;
    const model = document.querySelector('#package-model').value;
    const note = document.querySelector('#package-note').value.trim();
    const error = document.querySelector('#form-error');
    if (!name || !/^V\d+\.\d+\.\d+$/.test(version) || !note) {
      error.textContent = '请填写名称、三段式版本号（如 V1.3.1）和版本说明。'; return;
    }
    if (packages.some(item => item.locale === locale && item.models === model && item.version === version)) {
      error.textContent = '该机型与语种下已存在相同版本。'; return;
    }
    packages.unshift({ id: `LP-${100 + packages.length}`, name, locale, language: locale, version, models: model, firmware: '待发布时配置', size: '待上传', status: '草稿', updated: '2026-09-11 10:00', note });
    closeLayer(); render(); showToast('语言包草稿已保存');
  }

  function publishPackage() {
    const note = document.querySelector('#release-note').value.trim();
    const error = document.querySelector('#form-error');
    if (!note) { error.textContent = '请填写发布说明。'; return; }
    const item = state.selected;
    const mode = document.querySelector('#release-mode').value;
    const channel = document.querySelector('#release-channel').value;
    const scope = document.querySelector('#release-scope').value;
    releases.unshift({
      id: `REL-${1100 + releases.length}`, packageId: item.id, package: item.name, version: item.version,
      target: `${item.models} · ${channel} · ${scope || mode}`, mode, status: mode === '测试白名单' ? '验证中' : '发布中',
      operator: '刘媛媛', time: '2026-09-11 10:00'
    });
    item.status = mode === '灰度发布' ? '灰度中' : mode === '全量发布' ? '已发布' : '验证中';
    closeLayer(); state.section = 'releases'; location.hash = 'releases'; render(); showToast('发布任务已创建');
  }

  function showDialog(message, action) {
    dialogMessage.textContent = message; state.pending = action; overlay.classList.add('is-open');
  }
  function hideDialog() { overlay.classList.remove('is-open'); state.pending = null; }
  function showToast(message) {
    toast.textContent = message; toast.classList.add('is-open');
    window.setTimeout(() => toast.classList.remove('is-open'), 1800);
  }

  document.querySelector('#dialog-close').addEventListener('click', hideDialog);
  document.querySelector('#dialog-cancel').addEventListener('click', hideDialog);
  document.querySelector('#dialog-confirm').addEventListener('click', () => {
    const action = state.pending; hideDialog(); action?.();
  });
  overlay.addEventListener('click', event => { if (event.target === overlay) hideDialog(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { hideDialog(); closeLayer(); } });
  render();
})();
