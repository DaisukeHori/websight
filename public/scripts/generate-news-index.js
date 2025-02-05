const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ニュース記事のディレクトリ
const newsDir = path.join(__dirname, '../content/news');
// 出力するJSONファイルのパス
const outputPath = path.join(__dirname, '../content/news-index.json');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(newsDir)) {
    fs.mkdirSync(newsDir, { recursive: true });
}

// Markdownファイルを読み込んでJSONを生成する
function generateNewsIndex() {
    // ディレクトリ内のMarkdownファイルを取得
    const files = fs.readdirSync(newsDir).filter(file => file.endsWith('.md'));
    
    // 各ファイルのフロントマターを取得
    const newsItems = files.map(file => {
        const fullPath = path.join(newsDir, file);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        return {
            title: data.title,
            date: data.date,
            description: data.description,
            thumbnail: data.thumbnail,
            category: data.category,
            tags: data.tags,
            slug: path.basename(file, '.md'),
            body: content.substring(0, 200) // プレビュー用に本文の一部を含める
        };
    });

    // 日付順にソート
    newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    // JSONファイルとして保存
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(newsItems, null, 2));
    
    console.log(`News index generated at ${outputPath}`);
}

// インデックスを生成
generateNewsIndex();