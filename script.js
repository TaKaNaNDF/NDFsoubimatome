// データストレージ
let equipmentData = [];
let currentCategory = '';
let currentTags = [];

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromJSON();
    setupEventListeners();
});

function loadSampleData() {
    // サンプルデータ
    equipmentData = [
        {
            id: 1,
            name: "勇者の剣",
            category: "うで",
            stars: 5,
            image: "https://cdn.discordapp.com/attachments/1132509650168840197/1392059588534079498/e94474f69bd1c5a5.png?ex=686e2805&is=686cd685&hm=c9bd413857e00cf581aa00030a24395e8b06c66b91370cf599244c7dc80eae20&",
            effect: "攻撃力+50、クリティカル率+15%",
            tags: ["攻撃", "クリティカル", "伝説"]
        },
        {
            id: 2,
            name: "魔法のローブ",
            category: "ふく",
            stars: 4,
            image: "https://cdn.discordapp.com/attachments/1132509650168840197/1392059589712805989/8d26784b58ceb607.png?ex=686e2805&is=686cd685&hm=f4ee35d6e404f1dc37d7d780a11beca9acf9c562c512622cc4db0073763f6a8a&",
            effect: "魔法攻撃力+30、MP+20",
            tags: ["魔法", "MP", "レア"]
        }
    ];
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
    document.getElementById('tagInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });

    // フォーム送信
    document.getElementById('equipmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addEquipment();
    });
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
        </div>
    `).join('');
}

function openModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('equipmentForm').reset();
    currentTags = [];
    renderTags();
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
    const tagInput = document.getElementById('tagInput');
    
    container.innerHTML = currentTags.map(tag => `
        <span class="tag-item">
            ${tag}
            <span class="tag-remove" onclick="removeTag('${tag}')">&times;</span>
        </span>
    `).join('') + '<input type="text" id="tagInput" class="tag-input" placeholder="タグを入力してEnterキーを押してください">';
    
    // イベントリスナーを再設定
    document.getElementById('tagInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });
}

function addEquipment() {
    const name = document.getElementById('equipmentName').value;
    const category = document.getElementById('equipmentCategory').value;
    const stars = parseInt(document.getElementById('equipmentStars').value);
    
    const fileInput = document.getElementById('equipmentImageFile');
    if (!fileInput.files.length) return alert("画像ファイルを選択してください");
    const reader = new FileReader();
    reader.onload = function() {
        const image = reader.result;
        continueAddEquipment(image);
    };
    reader.readAsDataURL(fileInput.files[0]);
    return; // ファイル読み込み後に続きが実行されるので、ここで一旦抜ける
    
    const effect = document.getElementById('equipmentEffect').value;

    const newEquipment = {
        id: equipmentData.length + 1,
        name: name,
        category: category,
        stars: stars,
        image: image,
        effect: effect,
        tags: [...currentTags]
    };

    equipmentData.push(newEquipment);
    closeModal();
    
    // 追加後、該当カテゴリを表示
    showEquipmentList(category);
    
    alert('装備が追加されました！');
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    const modal = document.getElementById('addModal');
    if (event.target === modal) {
        closeModal();
    }
}

// 元のsubmit handlerを明示的に保持
document.getElementById('equipmentForm').onsubmit = defaultAddEquipmentHandler;

function defaultAddEquipmentHandler(e) {
    e.preventDefault();
    const name = document.getElementById('equipmentName').value;
    const category = document.getElementById('equipmentCategory').value;
    const stars = parseInt(document.getElementById('equipmentStars').value);
    
    const fileInput = document.getElementById('equipmentImageFile');
    if (!fileInput.files.length) return alert("画像ファイルを選択してください");
    const reader = new FileReader();
    reader.onload = function() {
        const image = reader.result;
        continueAddEquipment(image);
    };
    reader.readAsDataURL(fileInput.files[0]);
    return; // ファイル読み込み後に続きが実行されるので、ここで一旦抜ける
    
    const effect = document.getElementById('equipmentEffect').value;

    const newEquipment = {
        id: equipmentData.length > 0 ? Math.max(...equipmentData.map(e => e.id)) + 1 : 1,
        name, category, stars, image, effect,
        tags: [...currentTags]
    };

    equipmentData.push(newEquipment);
    closeModal();
    showEquipmentList(category);
    alert('装備が追加されました！');
}

function editEquipment(id) {
    const item = equipmentData.find(e => e.id === id);
    if (!item) return;

    document.getElementById('equipmentName').value = item.name;
    document.getElementById('equipmentCategory').value = item.category;
    document.getElementById('equipmentStars').value = item.stars;
    document.getElementById('equipmentImage').value = item.image;
    document.getElementById('equipmentEffect').value = item.effect;
    currentTags = [...item.tags];
    renderTags();

    openModal();

    document.getElementById('equipmentForm').onsubmit = function(e) {
        e.preventDefault();
        item.name = document.getElementById('equipmentName').value;
        item.category = document.getElementById('equipmentCategory').value;
        item.stars = parseInt(document.getElementById('equipmentStars').value);
        item.image = document.getElementById('equipmentImage').value;
        item.effect = document.getElementById('equipmentEffect').value;
        item.tags = [...currentTags];

        closeModal();
        showEquipmentList(item.category);
        alert('装備が更新されました！');

        document.getElementById('equipmentForm').onsubmit = defaultAddEquipmentHandler;
    };
}

function deleteEquipment(id) {
    if (!confirm('この装備を削除しますか？')) return;
    equipmentData = equipmentData.filter(e => e.id !== id);
    showEquipmentList(currentCategory);
}

async function saveToGitHub() {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(equipmentData, null, 2))));

    const repo = 'NDFsoubimatome';
    const path = 'soubihyou.json';
    const token = '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';
    const user = 'TaKaNaNDF';

    const getRes = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` }
    });

    const { sha } = await getRes.json();

    const res = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update equipment data',
            content,
            sha
        })
    });

    if (res.ok) {
        alert('GitHubに保存されました！');
    } else {
        alert('保存に失敗しました...');
        console.error(await res.json());
    }
}

function continueAddEquipment(image) {
    const name = document.getElementById('equipmentName').value;
    const category = document.getElementById('equipmentCategory').value;
    const stars = parseInt(document.getElementById('equipmentStars').value);
    const effect = document.getElementById('equipmentEffect').value;

    const newEquipment = {
        id: equipmentData.length > 0 ? Math.max(...equipmentData.map(e => e.id)) + 1 : 1,
        name, category, stars, image, effect,
        tags: [...currentTags]
    };

    equipmentData.push(newEquipment);
    closeModal();
    showEquipmentList(category);
    alert('装備が追加されました！');
}

async function loadDataFromJSON() {
    try {
        const res = await fetch('soubihyou.json');
        if (!res.ok) throw new Error('データ読み込み失敗');
        const data = await res.json();
        equipmentData = data;
        setupEventListeners();  // 読み込み後にイベントを設定
    } catch (e) {
        console.error('装備データの読み込みに失敗しました:', e);
        equipmentData = [];
        setupEventListeners();
    }
}