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

        if (!Array.isArray(news) || news.length === 0) {
            newsContainer.innerHTML = '<div class="col-12 text-center"><p>現在、新しいニュースはありません。</p></div>';
            return;
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
                        <a href="/news/${item.slug}.html" class="btn btn-link mt-2">続きを読む →</a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('ニュース記事の読み込みに失敗しました:', error);
        newsContainer.innerHTML = '<div class="col-12 text-center"><p>ニュースの読み込みに失敗しました。</p></div>';
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