exports.handler = async function(event, context) {
    // Pastikan request adalah POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed. Hanya menerima POST.' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const target = body.target;
        const pesan = body.pesan;

        // Logika Pintar: Membedakan Grup dan Nomor Pribadi
        let nomorHP = target;
        // Jika terdapat "@s.whatsapp.net" (Nomor pribadi), maka teks tersebut dibuang
        if (target.includes('@s.whatsapp.net')) {
            nomorHP = target.split('@')[0];
        }
        // Jika mengandung "@g.us" (Grup WhatsApp), sistem akan membiarkannya utuh

        // Mengirimkan perintah ke Fonnte
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': process.env.FONNTE_TOKEN, // Pastikan token sudah terpasang di Dashboard Netlify
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: nomorHP,
                message: pesan,
                countryCode: '62'
            })
        });

        const data = await response.json();

        if (data.status) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Pesan berhasil dikirim via Fonnte!' })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: data.reason || 'Ditolak oleh API Fonnte' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
