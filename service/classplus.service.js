
const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const fetchClassplusPage = async (url, token) => {
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-Access-Token": token,
                    Accept: "application/json",
                },
                signal: AbortSignal.timeout(30000),
            });

            // Retry temporary server failures / rate limits
            if (
                (response.status === 429 ||
                    response.status >= 500) &&
                attempt < MAX_ATTEMPTS
            ) {
                await response.body?.cancel();

                console.log(`Retrying attempt ${attempt + 1}`);

                await sleep(1000 * attempt);
                continue;
            }

            if (!response.ok) {
                throw new Error(
                    `Classplus HTTP ${response.status}`
                );
            }

            return await response.json();

        } catch (error) {
            const retryable =
                error.name === "TimeoutError" ||
                error.name === "AbortError" ||
                error.name === "TypeError";

            if (!retryable || attempt === MAX_ATTEMPTS) {
                throw error;
            }

            console.log(
                `Request failed: ${error.name}. Retry ${attempt + 1}`
            );

            await sleep(1000 * attempt);
        }
    }
};
