const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ニュース記事のディレクトリ（CMSコンテンツ）
const newsDir = path.join(__dirname, '../../content/news');
// 出力するJSONファイルのパス
const outputPath = path.join(__dirname, '../content/news-index.json');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

// Markdownファイルを読み込んでJSONを生成する
function generateNewsIndex() {
    try {
        // ディレクトリが存在しない場合は空の配列を返す
        if (!fs.existsSync(newsDir)) {
            fs.writeFileSync(outputPath, '[]');
            console.log('News directory not found. Created empty index.');
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
            
            return {
                title: data.title,
                date: data.date,
                description: data.description,
                thumbnail: data.thumbnail,
                category: data.category,
                tags: data.tags || [],
                slug: slug,
                body: content
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