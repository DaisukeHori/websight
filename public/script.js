// AOS (Animate On Scroll) の初期化
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // フォームバリデーションの初期化
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // ニュース記事の読み込み
    loadNews();
});

// ニュース記事を読み込む関数
async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    try {
        // news-index.jsonからニュース一覧を読み込む
        const response = await fetch('/content/news-index.json');
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        const text = await response.text(); // レスポンスを一旦テキストとして取得
        let news;
        try {
            news = JSON.parse(text); // JSONとしてパース
        } catch (e) {
            console.error('JSONパースエラー:', e);
            console.error('受信したテキスト:', text);
            throw new Error('JSONパースに失敗しました');
        }

        // 日付で降順ソート
        news.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 最新の3件のみ表示
        const recentNews = news.slice(0, 3);

        newsContainer.innerHTML = recentNews.map((item, index) => `
            <div class="col-lg-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="news-card">
                    ${item.thumbnail ? `
                        <div class="card-image-wrapper">
                            <img src="${item.thumbnail}" alt="${item.title}" class="card-img-top">
                        </div>
                    ` : ''}
                    <div class="card-body">
                        <div class="news-date">${formatDate(item.date)}</div>
                        <h3 class="h5">${item.title}</h3>
                        <p>${item.description || truncateText(item.body, 100)}</p>
                        <div class="news-meta">
                            ${item.category ? `<span class="badge bg-primary">${item.category}</span>` : ''}
                            ${item.tags ? item.tags.map(tag => `<span class="badge bg-secondary ms-1">${tag}</span>`).join('') : ''}
                        </div>
                        <a href="/content/news/${item.slug}.html" class="btn btn-link mt-2">続きを読む →</a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('ニュース記事の読み込みに失敗しました:', error);
        // エラー時は静的なコンテンツを表示
        displayStaticNews();
    }
}

// 日付のフォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '.');
}

// テキストの truncate
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// 静的なニュースの表示（フォールバック用）
function displayStaticNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    const staticNews = [
        {
            title: '新しいAIサービスをリリース',
            date: '2025.02.04',
            image: 'https://source.unsplash.com/featured/?deeplearning,future',
            description: '最新のディープラーニング技術を活用した画像認識サービスの提供を開始しました。',
            category: 'プレスリリース',
            tags: ['AI', '新サービス'],
            slug: '2025-02-04-ai-service'
        },
        {
            title: 'テクノロジーカンファレンスで講演',
            date: '2025.02.03',
            image: 'https://source.unsplash.com/featured/?conference,technology',
            description: '最新のWeb開発トレンドについて、当社エンジニアが基調講演を行いました。',
            category: 'お知らせ',
            tags: ['イベント', '講演'],
            slug: '2025-02-03-tech-conference'
        },
        {
            title: '新規プロジェクトメンバー募集',
            date: '2025.02.02',
            image: 'https://source.unsplash.com/featured/?office,developer',
            description: '急成長中の当社で、共に未来を創るエンジニアを募集しています。',
            category: '採用情報',
            tags: ['採用', 'エンジニア'],
            slug: '2025-02-02-recruitment'
        }
    ];

    newsContainer.innerHTML = staticNews.map((item, index) => `
        <div class="col-lg-4" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="news-card">
                <div class="card-image-wrapper">
                    <img src="${item.image}" alt="${item.title}" class="card-img-top">
                </div>
                <div class="card-body">
                    <div class="news-date">${item.date}</div>
                    <h3 class="h5">${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="news-meta">
                        ${item.category ? `<span class="badge bg-primary">${item.category}</span>` : ''}
                        ${item.tags ? item.tags.map(tag => `<span class="badge bg-secondary ms-1">${tag}</span>`).join('') : ''}
                    </div>
                    <a href="/content/news/${item.slug}.html" class="btn btn-link mt-2">続きを読む →</a>
                </div>
            </div>
        </div>
    `).join('');
}