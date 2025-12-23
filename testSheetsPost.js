const url =
  "https://script.google.com/macros/s/AKfycbzd6UF2xD_DxbGkwbswCo14jcDMnn6TZNbpth2Y4Y7oxk_jwEXTRQrR955-kQpyZO15/exec";

const payload = {
  token: "Bs7iGITBwmhRfPhHxMst98w2bkIDw6OPLmkEdYIIY9tcd6mybjkm7LxZsFcf0fBl",
  action: "create",
  payload: {
    tgId: "123",
    fullName: "Node Test",
    service: "wash",
    startsAt: "2025-12-24T11:41:00+02:00",
    endsAt: "2025-12-25T00:31:00+02:00",
    phone: "+380000000000",
    vehicle: "Audi A4",
    comment: "node fetch test",
  },
};

(async () => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(text);
})();
