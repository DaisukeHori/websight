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
        // content/news ディレクトリのマークダウンファイル一覧を取得
        const response = await fetch('/.netlify/git/github/contents/content/news');
        const files = await response.json();
        const newsPromises = files
            .filter(file => file.name.endsWith('.md'))
            .map(file => fetch(file.download_url).then(res => res.text()));

        const newsTexts = await Promise.all(newsPromises);
        const news = newsTexts.map(text => {
            // Front matterのパース
            const frontMatter = text.split('---')[1];
            const data = {};
            frontMatter.split('\n').forEach(line => {
                const [key, ...value] = line.split(':');
                if (key && value.length > 0) {
                    data[key.trim()] = value.join(':').trim();
                }
            });
            // 本文の取得
            const body = text.split('---')[2];
            return {
                ...data,
                body: body.trim(),
                date: new Date(data.date),
                slug: data.title.toLowerCase().replace(/\s+/g, '-')
            };
        });

        // 日付で降順ソート
        news.sort((a, b) => b.date - a.date);

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
                        <a href="/content/news/${item.slug}.html" class="btn btn-link">続きを読む →</a>
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
            url: '/content/news/2025-02-04-ai-service.html'
        },
        {
            title: 'テクノロジーカンファレンスで講演',
            date: '2025.02.03',
            image: 'https://source.unsplash.com/featured/?conference,technology',
            description: '最新のWeb開発トレンドについて、当社エンジニアが基調講演を行いました。',
            url: '/content/news/2025-02-03-tech-conference.html'
        },
        {
            title: '新規プロジェクトメンバー募集',
            date: '2025.02.02',
            image: 'https://source.unsplash.com/featured/?office,developer',
            description: '急成長中の当社で、共に未来を創るエンジニアを募集しています。',
            url: '/content/news/2025-02-02-recruitment.html'
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
                    <a href="${item.url}" class="btn btn-link">続きを読む →</a>
                </div>
            </div>
        </div>
    `).join('');
}