        // Simple JS for mobile menu toggle
        function toggleMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // Initialize Lucide icons (for the feather icon set)
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });

        // SVG Logo Component (Hands supporting a Light Bulb with a Paintbrush/Flame)
        function ArtisticGiantLogo(color = '#FFCC00', size = '32') {
            return `
                <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                    <!-- Hands (Silver/White) -->
                    <path d="M10 65C10 65 25 85 45 85C45 85 45 65 25 65C25 65 10 45 10 65Z" fill="#C0C0C0"/>
                    <path d="M90 65C90 65 75 85 55 85C55 85 55 65 75 65C75 65 90 45 90 65Z" fill="#C0C0C0"/>
                    
                    <!-- Light Bulb (Deep Yellow) -->
                    <circle cx="50" cy="35" r="25" fill="${color}"/>
                    <path d="M45 60L40 70H60L55 60H45Z" fill="${color}"/>
                    
                    <!-- Inner Paintbrush/Flame (Vivid Purple) -->
                    <path d="M50 45C50 45 52 38 50 30C48 38 50 45 50 45Z" fill="#39005C"/>
                    
                    <!-- Rays of Light (Deep Yellow) -->
                    <line x1="50" y1="5" x2="50" y2="15" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
                    <line x1="68" y1="12" x2="78" y2="19" stroke="${color}" stroke-width="4" stroke-linecap="round" transform="rotate(30 50 10)"/>
                    <line x1="85" y1="35" x2="95" y2="35" stroke="${color}" stroke-width="4" stroke-linecap="round" transform="rotate(60 50 35)"/>
                    <line x1="15" y1="35" x2="25" y2="35" stroke="${color}" stroke-width="4" stroke-linecap="round" transform="rotate(-60 50 35)"/>
                    <line x1="32" y1="12" x2="22" y2="19" stroke="${color}" stroke-width="4" stroke-linecap="round" transform="rotate(-30 50 10)"/>
                </svg>
            `;
        }

        // =========================================================
        // GEMINI API INTEGRATION
        // =========================================================

        const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
        const apiKey = ""; // Canvas will provide this automatically

        /**
         * Generic function to call the Gemini API with exponential backoff.
         * @param {object} payload - The API payload including contents and systemInstruction.
         * @returns {Promise<string>} - The generated text response.
         */
        async function callGeminiApi(payload) {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
            const MAX_RETRIES = 3;
            let resultText = '';

            for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        if (response.status === 429 && i < MAX_RETRIES - 1) {
                            // Rate limit, retry with backoff
                            const delay = Math.pow(2, i) * 1000;
                            console.warn(`Rate limit hit. Retrying in ${delay / 1000}s...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            continue;
                        }
                        throw new Error(`API call failed with status: ${response.status}`);
                    }

                    const result = await response.json();
                    const candidate = result.candidates?.[0];

                    if (candidate && candidate.content?.parts?.[0]?.text) {
                        resultText = candidate.content.parts[0].text;
                        break; // Success
                    } else {
                        throw new Error("Received empty or malformed response from API.");
                    }
                } catch (error) {
                    console.error("Gemini API Error:", error.message);
                    if (i === MAX_RETRIES - 1) {
                         resultText = `Error: Could not complete the request after ${MAX_RETRIES} attempts.`;
                    }
                }
            }
            return resultText;
        }

        /**
         * Feature 1: Generates an art prompt based on a user-provided theme.
         */
        async function generateArtPrompt() {
            const themeInput = document.getElementById('prompt-theme');
            const resultElement = document.getElementById('prompt-result');
            const generateButton = document.getElementById('generate-prompt-btn');

            const theme = themeInput.value.trim();

            if (!theme) {
                resultElement.innerHTML = `<p class="text-red-500 font-bold">Please enter a theme, color, or style to get inspired!</p>`;
                return;
            }

            generateButton.disabled = true;
            generateButton.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating Spark...`;
            resultElement.innerHTML = `<p class="text-vivid-purple/70 italic mt-4">Consulting the muse...</p>`;

            const systemPrompt = `You are a world-class art curator and instructor from ArtisticGiant Domain. Your goal is to provide a single, highly creative, and detailed art prompt for an artist. The prompt must be challenging and inspiring. The response must be formatted using markdown.`;
            
            const userQuery = `Generate a painting or drawing prompt based on the theme: "${theme}". The prompt should include subject, medium suggestions, and a specific mood or atmosphere to capture.`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const result = await callGeminiApi(payload);
            
            resultElement.innerHTML = `<div class="p-4 bg-gray-100 rounded-lg text-left whitespace-pre-wrap card-shadow">${result}</div>`;

            generateButton.disabled = false;
            generateButton.innerHTML = `<svg data-lucide="sparkles" class="w-5 h-5 mr-1"></svg>Generate Creative Prompt ✨`;
            if (typeof lucide !== 'undefined') { lucide.createIcons(); } // Re-initialize icons after content update
        }


        /**
         * Feature 2: Suggests product names and descriptions based on category and features.
         */
        async function generateProductNames() {
            const category = document.getElementById('product-category').value;
            const features = document.getElementById('product-features').value.trim();
            const resultElement = document.getElementById('product-naming-result');
            const generateButton = document.getElementById('generate-name-btn');

            if (!features) {
                resultElement.innerHTML = `<p class="text-red-500 font-bold">Please list the product features (e.g., 'fast drying, vibrant blue, eco-friendly').</p>`;
                return;
            }

            generateButton.disabled = true;
            generateButton.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-vivid-purple" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Naming Invention...`;
            resultElement.innerHTML = `<p class="text-deep-yellow/70 italic mt-4">Crafting market-ready names...</p>`;
            
            const systemPrompt = `You are a senior brand strategist for ArtisticGiant Domain. Your task is to generate three professional and inspiring product names for a new ${category} line, along with a short, compelling marketing description (1-2 sentences) for each. The tone should be elevated, ambitious, and premium. The response must be a valid JSON array of objects.`;

            const userQuery = `Generate names and descriptions for a new ${category} with the following features: "${features}".`;

            const schema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "name": { "type": "STRING", "description": "The creative and professional product name." },
                        "description": { "type": "STRING", "description": "A short, compelling marketing description." }
                    },
                    required: ["name", "description"]
                }
            };

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                },
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const jsonString = await callGeminiApi(payload);

            try {
                const names = JSON.parse(jsonString);
                let html = '<div class="space-y-4 text-left">';
                if (Array.isArray(names)) {
                    names.forEach((item, index) => {
                        html += `
                            <div class="p-4 bg-white rounded-lg border-l-4 border-deep-yellow shadow-md">
                                <h5 class="comfortaa text-xl font-bold text-vivid-purple mb-1">${index + 1}. ${item.name}</h5>
                                <p class="text-gray-600">${item.description}</p>
                            </div>
                        `;
                    });
                }
                html += '</div>';
                resultElement.innerHTML = html;
            } catch (e) {
                console.error("Failed to parse JSON response:", e, jsonString);
                resultElement.innerHTML = `<p class="text-red-500 font-bold">Error: Failed to process the naming suggestion. Try simplifying the features.</p>`;
            }

            generateButton.disabled = false;
            generateButton.innerHTML = `<svg data-lucide="award" class="w-5 h-5 mr-1"></svg>Generate Product Names ✨`;
            if (typeof lucide !== 'undefined') { lucide.createIcons(); } // Re-initialize icons after content update
        }
