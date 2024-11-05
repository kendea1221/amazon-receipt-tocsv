document.getElementById('generate-pdf').addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    const statusDiv = document.getElementById('status');

    if (fileInput.files.length === 0) {
        statusDiv.textContent = 'CSVファイルを選択してください。';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const csvData = event.target.result;
        const rows = csvData.split('\n');
        const orderIds = rows.slice(1).map(row => row.split(',')[0].trim()); // 1行目以外のA列を取得

        statusDiv.textContent = 'PDFを生成中...';

        const pdfContent = [];

        for (const orderId of orderIds) {
            try {
                // Amazonの領収書URLを生成
                const receiptUrl = `https://www.amazon.co.jp/gp/css/summary/print.html/ref=oh_aui_ajax_invoice?ie=UTF8&orderID=${orderId}`;
                
                // 領収書をスクレイピング
                const response = await fetch(receiptUrl, {
                    method: 'GET',
                    credentials: 'include' // Cookieを送信
                });

                if (!response.ok) {
                    throw new Error(`Error fetching receipt for order ID ${orderId}`);
                }

                const htmlContent = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');

                // 領収書の情報を取得
                const receiptText = doc.body.innerText; // ここで必要な情報を取得（必要に応じて調整）

                // PDFに追加する内容を作成
                pdfContent.push({
                    text: `領収書: 注文ID ${orderId}`,
                    style: 'header'
                });
                pdfContent.push(receiptText); // 領収書のテキストを追加
            } catch (error) {
                console.error(error);
                statusDiv.textContent = `エラー: ${error.message}`;
                return; // エラーが発生したら処理を中止
            }
        }

        const docDefinition = {
            content: [
                { text: 'Amazon 領収書', style: 'title' },
                { text: '以下の注文IDの領収書です:', margin: [0, 20, 0, 20] },
                ...pdfContent
            ],
            styles: {
                title: {
                    fontSize: 22,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                header: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 5, 0, 5]
                }
            }
        };

        pdfMake.createPdf(docDefinition).download('amazon_orders.pdf');
        statusDiv.textContent = 'PDFのダウンロードが完了しました。';
    };

    reader.readAsText(file);
});