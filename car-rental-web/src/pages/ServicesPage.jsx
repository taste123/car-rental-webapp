import React from 'react';

function ServicesPage() {
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-slate-800 mb-6">Layanan Kami</h1>
            <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>Kami menyediakan berbagai layanan untuk memastikan pengalaman sewa mobil Anda nyaman dan tanpa hambatan. Berikut adalah beberapa layanan unggulan kami:</p>
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li><strong>Sewa Mobil Harian, Mingguan, dan Bulanan:</strong> Fleksibilitas penyewaan sesuai dengan kebutuhan perjalanan Anda.</li>
                    <li><strong>Layanan Antar-Jemput:</strong> Kami dapat mengantarkan dan menjemput mobil di lokasi yang Anda tentukan, seperti bandara, hotel, atau rumah.</li>
                    <li><strong>Sopir Profesional:</strong> Butuh pengemudi? Kami menyediakan sopir berpengalaman yang mengenal baik area lokal.</li>
                    <li><strong>Asuransi Perjalanan:</strong> Semua mobil kami dilengkapi dengan asuransi untuk memberikan Anda ketenangan pikiran selama berkendara.</li>
                    <li><strong>Dukungan Pelanggan 24/7:</strong> Tim kami siap membantu Anda kapan saja jika Anda mengalami kendala di jalan.</li>
                </ul>
                <p>Kami berkomitmen untuk memberikan kualitas layanan terbaik dengan armada mobil yang terawat dan harga yang kompetitif.</p>
            </div>
        </div>
    );
}

export default ServicesPage;