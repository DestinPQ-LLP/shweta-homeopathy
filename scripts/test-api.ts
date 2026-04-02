async function verifyApi() {
  console.log("Logging into production admin...");
  const authRes = await fetch("https://shweta.destinpq.com/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "admin1234" })
  });
  
  const authData = await authRes.json();
  console.log("Auth response:", authData);
  
  if (authData.token) {
    console.log("Fetching clients...");
    const clientsRes = await fetch("https://shweta.destinpq.com/api/admin/clients", {
      headers: { "Authorization": `Bearer ${authData.token}` }
    });
    console.log("Clients response status:", clientsRes.status);
  }
}

verifyApi().catch(console.error);
