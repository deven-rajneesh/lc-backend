
export const getCourseVideos = async (req, res) => {
    try {
        const { courseId } = req.params;

        const allVideos = [];
        const seenPages = new Set();
        const pageSize = 10;
        const maxPages = 100;
        let offset = 0;

        while (true) {
            if (offset / pageSize >= maxPages) {
                throw new Error("Classplus pagination exceeded the page limit");
            }
            const url = new URL(process.env.CLASSPLUS_API_URL);

            url.searchParams.set("courseId", courseId);
            url.searchParams.set("folderId", "-1");
            url.searchParams.set("storeContentEvent", "false");
            url.searchParams.set("isDiy", "1");
            url.searchParams.set("offset", String(offset));
            url.searchParams.set("limit", String(pageSize));
            url.searchParams.set("isSubContent", "false");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-Access-Token": process.env.CLASSPLUS_ACCESS_TOKEN,
                    Accept: "application/json",
                },
                signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) {
                throw new Error(`Classplus HTTP ${response.status}`);
            }

            const result = await response.json();

            const items = result?.data?.courseContent ?? [];

            // Stop when Classplus returns null or []
            if (items == null || (Array.isArray(items) && items.length === 0)) {
                break;
            }

            if (!Array.isArray(items)) {
                throw new Error("Unexpected Classplus response");
            }

            const pageSignature = JSON.stringify(items);
            if (seenPages.has(pageSignature)) {
                throw new Error(`Classplus repeated a page at offset ${offset}`);
            }
            seenPages.add(pageSignature);

            allVideos.push(...items);

            // console.log(
            //     `Offset: ${offset} | Received: ${items.length}`
            // );

            offset += pageSize;
        }

        return res.status(200).json({
            success: true,
            courseId,
            totalVideos: allVideos.length,
            videos: allVideos,
        });

    } catch (error) {
        console.error("Fetch error:", error.message);

        return res.status(502).json({
            success: false,
            message: "Failed to fetch Classplus videos",
        });
    }
};
