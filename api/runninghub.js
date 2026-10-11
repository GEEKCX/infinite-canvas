// RunningHub API Proxy — Node.js runtime
// 接收带自定义 header 的 POST 请求，转发到 RunningHub，绕过 CORS

async function readRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

export default async function handler(req, res) {
    // ── CORS 预检 ──
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Max-Age", "86400");
        return res.status(204).end();
    }

    // ── 业务请求 ──
    const endpoint = req.headers["x-runninghub-endpoint"];
    const auth = req.headers["x-runninghub-auth"];

    if (!endpoint) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(400).json({ errorMessage: "Missing x-runninghub-endpoint header" });
    }

    const contentType = req.headers["content-type"] || "application/json";
    const hasFormData = contentType.includes("multipart/form-data");

    try {
        // 根据 Content-Type 选择正确的 body 处理方式
        let body;
        if (hasFormData) {
            // multipart/form-data：读取原始二进制，保留 boundary
            body = await readRawBody(req);
        } else if (typeof req.body === "object" && req.body !== null && !Buffer.isBuffer(req.body)) {
            // application/json：Vercel 已自动解析，重新序列化
            body = JSON.stringify(req.body);
        } else {
            // 其他（已序列化的字符串或原始数据）
            body = req.body;
        }

        const upstream = await fetch("https://www.runninghub.cn" + endpoint, {
            method: "POST",
            headers: {
                Authorization: auth || "",
                "Content-Type": contentType,
            },
            body: body || undefined,
        });

        const text = await upstream.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { errorMessage: text };
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(upstream.status).json(data);
    } catch (error) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(502).json({
            errorMessage: error instanceof Error ? error.message : String(error),
        });
    }
}
