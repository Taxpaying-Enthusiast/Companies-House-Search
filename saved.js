document.addEventListener("DOMContentLoaded", async () => {
  const savedCompaniesDiv = document.getElementById("saved-companies");

  const loadSavedCompanies = async () => {
    try {
      const response = await fetch("/saved");
      const savedCompanies = await response.json();

      savedCompaniesDiv.innerHTML = "";

      savedCompanies.forEach((company) => {
        const savedDiv = document.createElement("div");
        savedDiv.classList.add("company");

        let statusClass = "";
        if (company.company_status === "active") statusClass = "status-active";
        else if (company.company_status === "dissolved")
          statusClass = "status-dissolved";
        else if (company.company_status === "liquidation")
          statusClass = "status-liquidation";

        savedDiv.innerHTML = `
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
                          company.accounts?.next_due || "N/A"
                        }</p>
                        <p><strong>Confirmation Statement Due:</strong> ${
                          company.confirmation_statement?.next_due || "N/A"
                        }</p>
                        <button class="remove-button" onclick="removeCompany('${
                          company.company_number
                        }')">Remove</button>
                    </div>
                `;

        savedCompaniesDiv.appendChild(savedDiv);
      });
    } catch (error) {
      console.error("Error loading saved companies:", error);
    }
  };

  window.toggleCompanyDetails = function (headerElement) {
    const details = headerElement.nextElementSibling;
    details.classList.toggle("hidden");
  };

  window.removeCompany = async function (companyNumber) {
    await fetch(`/remove/${companyNumber}`, { method: "DELETE" });
    loadSavedCompanies();
  };

  loadSavedCompanies();
});
