const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const Handlebars = require('handlebars');

// ニュース記事のディレクトリ(CMSコンテンツ)
const newsDir = path.join(__dirname, '../content/news');
// 出力するJSONファイルのパス
const outputPath = path.join(__dirname, '../content/news-index.json');
// テンプレートファイルのパス
const templatePath = path.join(__dirname, '../news/template.html');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

// 日付のフォーマット
function formatDate(date) {
    return new Date(date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '.');
}

// Markdownをパースしてニュース記事を生成する
function generateNewsArticle(content, data, template, slug) {
    const articleData = {
        ...data,
        content: content,
        date: formatDate(data.date)
    };

    const html = template(articleData);
    const outputDir = path.join(__dirname, '../news');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, `${slug}.html`), html);
}

// Markdownファイルを読み込んでJSONとHTMLを生成する
function generateNewsIndex() {
    try {
        // テンプレートの読み込み
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);

        // ディレクトリが存在しない場合は空の配列を返す
        if (!fs.existsSync(newsDir)) {
            fs.mkdirSync(newsDir, { recursive: true });
            fs.writeFileSync(outputPath, '[]');
            console.log('News directory created. Created empty index.');
            return;
        }

        // ディレクトリ内のMarkdownファイルを取得
        const files = fs.readdirSync(newsDir).filter(file => file.endsWith('.md'));
        
        if (files.length === 0) {
            fs.writeFileSync(outputPath, '[]');
            console.log('No news articles found. Created empty index.');
            return;
        }

        // 各ファイルのフロントマターを取得
        const newsItems = files.map(file => {
            const fullPath = path.join(newsDir, file);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);
            
            // slugがない場合はファイル名から生成
            const slug = data.slug || path.basename(file, '.md');
            
            // HTML記事を生成
            generateNewsArticle(content, data, template, slug);

            return {
                title: data.title,
                date: data.date,
                description: data.description,
                thumbnail: data.thumbnail,
                category: data.category,
                tags: data.tags || [],
                slug: slug,
                gallery: data.gallery || [],
                links: data.links || [],
                author: data.author,
                featured: data.featured || false
            };
        });

        // 日付順にソート
        newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // JSONファイルとして保存
        fs.writeFileSync(outputPath, JSON.stringify(newsItems, null, 2));
        console.log(`News index generated at ${outputPath}`);
        console.log(`Generated ${newsItems.length} articles`);

    } catch (error) {
        console.error('Error generating news index:', error);
        // エラー時は空の配列を保存
        fs.writeFileSync(outputPath, '[]');
    }
}

// インデックスを生成
generateNewsIndex();