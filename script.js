// データストレージ
let equipmentData = [];
let currentCategory = '';
let currentTags = [];

// モーダルの状態管理
let isEditing = false;
let editingEquipmentId = null;

// カスタムモーダルのコールバック用
let confirmCallback = null;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromJSON();
    // setupEventListeners()はloadDataFromJSONのfinallyブロックで呼び出される
});

// メッセージモーダル表示
function showMessageModal(title, message) {
    document.getElementById('messageModalTitle').innerText = title;
    document.getElementById('messageModalBody').innerText = message;
    document.getElementById('messageModal').style.display = 'block';
}

// メッセージモーダル非表示
function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
}

// 確認モーダル表示
function showConfirmModal(title, message, callback) {
    document.getElementById('confirmModalTitle').innerText = title;
    document.getElementById('confirmModalBody').innerText = message;
    confirmCallback = callback; // コールバック関数を保存
    document.getElementById('confirmModal').style.display = 'block';
}

// 確認モーダル非表示（結果をコールバックに渡す）
function closeConfirmModal(result) {
    document.getElementById('confirmModal').style.display = 'none';
    if (confirmCallback) {
        confirmCallback(result);
        confirmCallback = null; // コールバックをリセット
    }
}

function setupEventListeners() {
    // カテゴリクリック
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            showEquipmentList(category);
        });
    });

    // 検索機能
    document.getElementById('searchBox').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm) {
            showSearchResults(searchTerm);
        } else {
            showCategoryView();
        }
    });

    // タグ入力
    // 初期化時に一度だけイベントリスナーを設定
    const tagInput = document.getElementById('tagInput');
    if (tagInput) { // tagInputが存在するか確認
        tagInput.removeEventListener('keypress', handleTagInputKeypress); // 既存のリスナーを削除
        tagInput.addEventListener('keypress', handleTagInputKeypress); // 新しいリスナーを追加
    }

    // フォーム送信
    document.getElementById('equipmentForm').removeEventListener('submit', handleEquipmentSubmit); // 既存のリスナーを削除
    document.getElementById('equipmentForm').addEventListener('submit', handleEquipmentSubmit); // 新しいリスナーを追加
}

// タグ入力のイベントハンドラ
function handleTagInputKeypress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTag(this.value.trim());
        this.value = '';
    }
}

function showCategoryView() {
    document.getElementById('categoryView').style.display = 'grid';
    document.getElementById('equipmentView').style.display = 'none';
    currentCategory = '';
}

function showEquipmentList(category) {
    currentCategory = category;
    document.getElementById('categoryView').style.display = 'none';
    document.getElementById('equipmentView').style.display = 'block';
    
    const filteredEquipment = equipmentData.filter(item => item.category === category);
    renderEquipmentList(filteredEquipment);
}

function showSearchResults(searchTerm) {
    const filteredEquipment = equipmentData.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.effect.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    document.getElementById('categoryView').style.display = 'none';
    document.getElementById('equipmentView').style.display = 'block';
    renderEquipmentList(filteredEquipment);
}

function renderEquipmentList(equipment) {
    const container = document.getElementById('equipmentList');
    
    if (equipment.length === 0) {
        container.innerHTML = '<div class="no-results">該当する装備が見つかりませんでした</div>';
        return;
    }

    container.innerHTML = equipment.map(item => `
        <div class="equipment-item">
            <img src="${item.image}" alt="${item.name}" class="equipment-image">
            <div class="equipment-info">
                <div class="equipment-header">
                    <div class="star-rating">
                        ${'★'.repeat(item.stars)}
                    </div>
                    <div class="equipment-name">${item.name}</div>
                </div>
                <div class="equipment-effect">${item.effect}</div>
                <div class="equipment-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="edit-buttons-container">
                <button class="edit-button" onclick="editEquipment(${item.id})">編集</button>
                <button class="delete-button" onclick="deleteEquipment(${item.id})">削除</button>
            </div>
        </div>
    `).join('');
}

// モーダルを開く
function openModal(mode = 'add', equipment = null) {
    document.getElementById('addModal').style.display = 'block';
    document.getElementById('equipmentForm').reset();
    currentTags = [];
    renderTags();

    // 画像ファイル入力のリセット
    document.getElementById('equipmentImageFile').value = '';

    if (mode === 'edit' && equipment) {
        isEditing = true;
        editingEquipmentId = equipment.id;
        document.getElementById('modalTitle').innerText = '装備を編集';
        document.getElementById('equipmentName').value = equipment.name;
        document.getElementById('equipmentCategory').value = equipment.category;
        document.getElementById('equipmentStars').value = equipment.stars;
        document.getElementById('equipmentEffect').value = equipment.effect;
        currentTags = [...equipment.tags];
        renderTags();
    } else {
        isEditing = false;
        editingEquipmentId = null;
        document.getElementById('modalTitle').innerText = '装備を追加';
    }
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('equipmentForm').reset();
    currentTags = [];
    renderTags();
    isEditing = false; // 状態をリセット
    editingEquipmentId = null; // 状態をリセット
}

function addTag(tagText) {
    if (tagText && !currentTags.includes(tagText)) {
        currentTags.push(tagText);
        renderTags();
    }
}

function removeTag(tagText) {
    currentTags = currentTags.filter(tag => tag !== tagText);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('tagContainer');
    // タグ入力フィールドを一時的に削除して、タグを再描画
    const tagInputHtml = '<input type="text" id="tagInput" class="tag-input" placeholder="タグを入力してEnterキーを押してください">';
    container.innerHTML = currentTags.map(tag => `
        <span class="tag-item">
            ${tag}
            <span class="tag-remove" onclick="removeTag('${tag}')">&times;</span>
        </span>
    `).join('') + tagInputHtml;
    
    // イベントリスナーを再設定
    const newTagInput = document.getElementById('tagInput');
    if (newTagInput) {
        newTagInput.removeEventListener('keypress', handleTagInputKeypress); // 既存のリスナーを削除
        newTagInput.addEventListener('keypress', handleTagInputKeypress); // 新しいリスナーを追加
    }
}

// フォーム送信のメインハンドラ
async function handleEquipmentSubmit() {
    const name = document.getElementById('equipmentName').value;
    const category = document.getElementById('equipmentCategory').value;
    const stars = parseInt(document.getElementById('equipmentStars').value);
    const effect = document.getElementById('equipmentEffect').value;
    const fileInput = document.getElementById('equipmentImageFile');

    let image = null;

    if (fileInput.files.length > 0) {
        // 新しい画像が選択された場合、読み込む
        image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function() {
                resolve(reader.result);
            };
            reader.readAsDataURL(fileInput.files[0]);
        });
    } else if (isEditing && editingEquipmentId !== null) {
        // 編集モードで新しい画像が選択されていない場合、既存の画像を維持
        const existingEquipment = equipmentData.find(e => e.id === editingEquipmentId);
        if (existingEquipment) {
            image = existingEquipment.image;
        }
    } else {
        // 新規追加で画像が選択されていない場合
        showMessageModal('エラー', '画像ファイルを選択してください。');
        return;
    }

    if (isEditing) {
        // 既存の装備を更新
        const index = equipmentData.findIndex(e => e.id === editingEquipmentId);
        if (index !== -1) {
            equipmentData[index] = {
                id: editingEquipmentId, // IDは変更しない
                name, category, stars, image, effect,
                tags: [...currentTags]
            };
            showMessageModal('更新完了', '装備が更新されました！');
        }
    } else {
        // 新しい装備を追加
        const newId = equipmentData.length > 0 ? Math.max(...equipmentData.map(e => e.id)) + 1 : 1;
        const newEquipment = {
            id: newId,
            name, category, stars, image, effect,
            tags: [...currentTags]
        };
        equipmentData.push(newEquipment);
        showMessageModal('追加完了', '装備が追加されました！');
    }

    closeModal();
    showEquipmentList(category); // 追加/編集したカテゴリを表示
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    const addModal = document.getElementById('addModal');
    const messageModal = document.getElementById('messageModal');
    const confirmModal = document.getElementById('confirmModal');
    if (event.target === addModal) {
        closeModal();
    } else if (event.target === messageModal) {
        closeMessageModal();
    } else if (event.target === confirmModal) {
        // 確認モーダルは外クリックでは閉じない（ユーザーの意図的な操作を促すため）
    }
}

// 装備編集
function editEquipment(id) {
    const item = equipmentData.find(e => e.id === id);
    if (!item) return;
    openModal('edit', item);
}

// 装備削除
function deleteEquipment(id) {
    showConfirmModal('削除の確認', 'この装備を削除しますか？', (result) => {
        if (result) {
            equipmentData = equipmentData.filter(e => e.id !== id);
            showEquipmentList(currentCategory);
            showMessageModal('削除完了', '装備が削除されました！');
        }
    });
}

// GitHubに保存
async function saveToGitHub() {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(equipmentData, null, 2))));

    const repo = 'NDFsoubimatome';
    const path = 'soubihyou.json';
    const token = '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'; // 注意: このトークンは公開リポジトリに直接含めるべきではありません
    const user = 'TaKaNaNDF';

    try {
        const getRes = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
            headers: { Authorization: `token ${token}` }
        });

        let sha = null;
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        } else if (getRes.status !== 404) { // 404はファイルが存在しない場合なのでOK
            throw new Error('GitHubからファイル情報を取得できませんでした。');
        }

        const res = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update equipment data',
                content,
                sha // shaは新規作成の場合は不要、更新の場合は必須
            })
        });

        if (res.ok) {
            showMessageModal('保存完了', 'GitHubに保存されました！');
        } else {
            const errorData = await res.json();
            console.error('保存に失敗しました:', errorData);
            showMessageModal('保存失敗', `保存に失敗しました... エラー: ${errorData.message || '不明なエラー'}`);
        }
    } catch (e) {
        console.error('GitHub保存中にエラーが発生しました:', e);
        showMessageModal('エラー', `GitHub保存中にエラーが発生しました: ${e.message}`);
    }
}

// JSONデータ読み込み
async function loadDataFromJSON() {
    try {
        const res = await fetch('soubihyou.json');
        if (!res.ok) {
            // soubihyou.jsonが存在しない、または読み込みに失敗した場合
            if (res.status === 404) {
                console.warn('soubihyou.jsonが見つかりませんでした。新しいデータで開始します。');
            } else {
                throw new Error(`データ読み込み失敗: ${res.status} ${res.statusText}`);
            }
        }
        const data = res.ok ? await res.json() : []; // 成功した場合のみJSONをパース
        equipmentData = data;
    } catch (e) {
        console.error('装備データの読み込みに失敗しました:', e);
        equipmentData = []; // エラー時は空の配列で初期化
        showMessageModal('データ読み込みエラー', '装備データの読み込みに失敗しました。新しいデータで開始します。');
    } finally {
        // データ読み込みの成功・失敗に関わらず、イベントリスナーを設定
        setupEventListeners();
        // 初期表示としてカテゴリビューを表示
        showCategoryView();
    }
}
