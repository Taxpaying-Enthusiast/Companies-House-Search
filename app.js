document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const resultsContainer = document.getElementById("search-results");
    const companyDetailsContainer = document.getElementById("company-details");

    // Fetch companies based on search query
    async function fetchCompanyData(query) {
        try {
            const response = await fetch(`/search?query=${query}`);
            const data = await response.json();

            if (data && data.items) {
                displaySearchResults(data.items);
            } else {
                resultsContainer.innerHTML = "<p>No results found.</p>";
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            resultsContainer.innerHTML = "<p>Error fetching data.</p>";
        }
    }

    // Display search results on the page
    function displaySearchResults(companies) {
        resultsContainer.innerHTML = ""; // Clear previous results

        companies.forEach((company) => {
            const companyElement = document.createElement("div");
            companyElement.classList.add("company-item");
            companyElement.innerHTML = `
                <p><strong>${company.title}</strong></p>
                <p>Company Number: ${company.company_number}</p>
                <button class="view-details" data-number="${company.company_number}">View Details</button>
            `;
            resultsContainer.appendChild(companyElement);
        });

        // Attach event listeners for each "View Details" button
        document.querySelectorAll(".view-details").forEach((button) => {
            button.addEventListener("click", function () {
                const companyNumber = this.getAttribute("data-number");
                fetchCompanyDetails(companyNumber);
            });
        });
    }

    // Fetch details for a specific company
    async function fetchCompanyDetails(companyNumber) {
        try {
            const response = await fetch(`/company/${companyNumber}`);
            const company = await response.json();

            if (company) {
                displayCompanyDetails(company);
            } else {
                companyDetailsContainer.innerHTML = "<p>Company details not found.</p>";
            }
        } catch (error) {
            console.error("Error fetching company details:", error);
            companyDetailsContainer.innerHTML = "<p>Error fetching company details.</p>";
        }
    }

    // Format date function: returns formatted date or "N/A"
    function formatDate(dateString) {
        return dateString ? new Date(dateString).toLocaleDateString("en-GB") : "N/A";
    }

    // Display detailed company information including Save and Toggle buttons
    function displayCompanyDetails(company) {
        let statusColor = "gray"; // Default color for status
        if (company.company_status === "active") statusColor = "green";
        else if (company.company_status === "dissolved") statusColor = "red";
        else if (company.company_status === "liquidation") statusColor = "yellow";

        companyDetailsContainer.innerHTML = `
            <div id="company-info">
                <p><strong>Company Name:</strong> ${company.company_name}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}">${company.company_status}</span></p>
                <p><strong>Accounts Due Date:</strong> ${formatDate(company.accounts?.next_due_date)}</p>
                <p><strong>Confirmation Statement Due:</strong> ${formatDate(company.confirmation_statement?.next_due_date)}</p>
                <button id="save-company" data-number="${company.company_number}">Save Company</button>
                <button id="toggle-details">Hide Details</button>
            </div>
        `;

        // Add event listener to "Save Company" button
        const saveButton = document.getElementById("save-company");
        saveButton.addEventListener("click", function () {
            saveCompany(company);
        });

        // Add event listener to "Toggle Details" button
        const toggleButton = document.getElementById("toggle-details");
        toggleButton.addEventListener("click", function () {
            toggleCompanyDetails();
        });
    }

    // Save company function: saves company details to localStorage (as an example)
    function saveCompany(company) {
        let savedCompanies = JSON.parse(localStorage.getItem("savedCompanies")) || [];
        // Check if company is already saved
        const exists = savedCompanies.some((item) => item.company_number === company.company_number);
        if (!exists) {
            savedCompanies.push(company);
            localStorage.setItem("savedCompanies", JSON.stringify(savedCompanies));
            alert("Company saved successfully!");
        } else {
            alert("Company is already saved.");
        }
    }

    // Toggle company details visibility
    function toggleCompanyDetails() {
        const companyInfoDiv = document.getElementById("company-info");
        const toggleButton = document.getElementById("toggle-details");
        if (companyInfoDiv.style.display === "none") {
            companyInfoDiv.style.display = "block";
            toggleButton.textContent = "Hide Details";
        } else {
            companyInfoDiv.style.display = "none";
            toggleButton.textContent = "Show Details";
        }
    }

    // Handle search form submission
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            fetchCompanyData(query);
        }
    });
});
 