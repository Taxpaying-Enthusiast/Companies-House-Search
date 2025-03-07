document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const resultsDiv = document.getElementById("results");

  // Function to perform search
  const performSearch = async () => {
    const query = searchInput.value.trim();
    if (!query) return alert("Please enter a company name!");

    try {
      const response = await fetch(`/search?q=${query}`);
      const data = await response.json();

      resultsDiv.innerHTML = ""; // Clear previous results

      if (data.items && data.items.length > 0) {
        // Process each company from search results
        data.items.forEach(async (company) => {
          try {
            // Fetch detailed company data from a new endpoint on the server
            const detailResponse = await fetch(
              `/company/${company.company_number}`
            );
            const detailsData = await detailResponse.json();
            // Merge detailed fields into the original company object
            const fullCompany = { ...company, ...detailsData };

            const companyDiv = document.createElement("div");
            companyDiv.classList.add("company");

            let statusClass = "";
            if (company.company_status === "active")
              statusClass = "status-active";
            else if (company.company_status === "dissolved")
              statusClass = "status-dissolved";
            else if (company.company_status === "liquidation")
              statusClass = "status-liquidation";

            companyDiv.innerHTML = `
                            <div class="company-header" onclick="toggleCompanyDetails(this)">
                                <strong>${company.title}</strong> 
                                <span class="company-status ${statusClass}">${
              company.company_status
            }</span>
                            </div>
                            <div class="company-details hidden">
                                <p><strong>Company Number:</strong> ${
                                  company.company_number || "N/A"
                                }</p>
                                <p><strong>Accounts Due:</strong> ${
                                  fullCompany.accounts?.next_due || "N/A"
                                }</p>
                                <p><strong>Confirmation Statement Due:</strong> ${
                                  fullCompany.confirmation_statement
                                    ?.next_due || "N/A"
                                }</p>
                                <button class="save-button" onclick='saveCompany(${JSON.stringify(
                                  company
                                )
                                  .replace(/'/g, "&#39;")
                                  .replace(/"/g, "&quot;")})'>Save</button>
                            </div>
                        `;

            resultsDiv.appendChild(companyDiv);
          } catch (detailError) {
            console.error(
              "Error fetching details for company",
              company.company_number,
              detailError
            );
          }
        });
      } else {
        resultsDiv.innerHTML = "<p>No results found.</p>";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      resultsDiv.innerHTML = "<p>Error fetching data.</p>";
    }
  };

  // Toggle the company details visibility
  window.toggleCompanyDetails = function (headerElement) {
    const details = headerElement.nextElementSibling;
    details.classList.toggle("hidden");
  };

  // Save company function using backend API
  window.saveCompany = async function (company) {
    try {
      await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      alert("Company saved successfully!");
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  // Event listeners for search
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch();
    }
  });
});
