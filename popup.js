document.getElementById("export").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const data = [["Order ID"]]; // CSVのヘッダーとして"Order ID"を設定

            document.querySelectorAll(".order").forEach(order => {
                const orderId = order.querySelector("bdi[dir='ltr'],span[dir='ltr']")?.innerText.trim() || "N/A";
                data.push([orderId]);
            });

            const csvContent = data.map(e => e.join(",")).join("\n");
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv" }));
            link.download = "amazon_order_ids.csv";
            link.click();
        }
    });
});