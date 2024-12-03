document.getElementById('pingform').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const siteUrl = document.getElementById('urlInput').value.trim();
    const resultDiv = document.getElementById('pingResults');

    // Validate input
    if (!siteUrl) {
        alert('Please enter a Hostname or IP Address');
        return;
    }

    // Clear previous results
    resultDiv.innerHTML = '<p class="text-gray-500">Pinging...</p>';

    // Fetch the user's public IP address (optional, can be removed if not needed)
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const userIp = data.ip;

            // Perform ping requests (adjust number of attempts as needed)
            const attempts = 5;
            let successCount = 0;
            let times = [];

            const pingPromises = [];
            for (let i = 0; i < attempts; i++) {
                const startTime = Date.now();
                const pingPromise = fetch(siteUrl, { mode: 'no-cors' })
                    .then(response => {
                        const endTime = Date.now();
                        const timeTaken = endTime - startTime;
                        times.push(timeTaken);
                        successCount++;
                    })
                    .catch(error => {
                        console.error('Ping failed:', error);
                    });
                pingPromises.push(pingPromise);
            }

            // Resolve all ping promises
            Promise.all(pingPromises)
                .then(() => {
                    // Calculate statistics
                    const loss = ((attempts - successCount) / attempts) * 100;
                    const minTime = Math.min(...times);
                    const maxTime = Math.max(...times);
                    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

                    // Update HTML with ping results
                    resultDiv.innerHTML = `
                        <p class="font-extrabold italic text-[#f0f1f1] pl-2 pr-2 pt-2 pb-2 bg-black border-[1px] border-solid border-[#1c4641]">Ping completed with ${attempts} attempts</p>
                        <p class="font-extrabold italic text-[#f0f1f1] pl-2 pr-2 pt-2 pb-2 bg-black border-[1px] border-solid border-[#1c4641] ">Packet Loss: ${loss.toFixed(2)}%</p>
                        <p class="font-extrabold italic  text-[#f0f1f1] pl-2 pr-2 pt-2 pb-2 bg-black border-[1px] border-solid border-[#1c4641] ">Min RTT: ${minTime} ms</p>
                        <p class="font-extrabold italic text-[#f0f1f1] pl-2 pr-2 pt-2 pb-2 bg-black border-[1px] border-solid border-[#1c4641] ">Max RTT: ${maxTime} ms</p>
                        <p class=" font-extrabold italic text-[#f0f1f1] pl-2 pr-2 pt-2 pb-2 bg-black border-[1px] border-solid border-[#1c4641] "  >Avg RTT: ${avgTime.toFixed(2)} ms</p>
                        <p class=" font-extrabold italic text-[#f0f1f1] pl-2 pr-2 pt-2 pb-2 bg-black border-[1px] border-solid border-[#1c4641]" >Your IP Address: ${userIp}</p>
                    `;
                })
                .catch(error => {
                    console.error('Failed to ping website:', error);
                    resultDiv.innerHTML = '<p class="text-red-500">Failed to ping website</p>';
                });
        })
        .catch(error => {
            console.error('Failed to fetch IP:', error);
            resultDiv.innerHTML = '<p class="text-red-500">Failed to fetch IP address</p>';
        });
});