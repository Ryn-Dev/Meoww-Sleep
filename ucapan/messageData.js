export function getMotivationalMessage() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const currentSeconds = currentDate.getSeconds();

    let message = [];

    if (currentMonth === 11 && currentDay === 3) {
        message = ["Selamat Ulang Tahun", "Febryan"];
    }
    else if (currentMonth === 0 && currentDay === 1 && currentHours === 0 && currentMinutes === 0 && currentSeconds === 0) {
        message = ["Selamat Tahun Baru", currentYear.toString()];
    }
    else {
        if (currentDay === 1) {
            const motivationalMessages = [
                ["Awali tahun dengan semangat!", "Jangan berhenti berusaha!"],
                ["Fokus pada tujuanmu!", "Kejar impianmu!"],
                ["Tetap semangat, sukses menanti!", "Jangan menyerah!"],
                ["Bermimpi itu penting!", "Sekarang waktunya bertindak!"],
                ["Fokus dan optimis!", "Keberhasilan menunggu!"],
                ["Saatnya menuju puncak!", "Terus berjuang!"],
                ["Peluang baru, ambil kesempatan!", "Jangan ragu!"],
                ["Kerja keras, hasilnya luar biasa!", "Berkarya lebih baik!"],
                ["Terus maju, jangan mundur!", "Sukses menanti!"],
                ["Kejar mimpi, capai tujuan!", "Bulan kemenangan!"],
                ["Kerja keras membuahkan hasil!", "Semangat terus!"],
                ["Akhir tahun penuh pencapaian!", "Istirahat setelah berjuang!"]
            ];
            message = motivationalMessages[currentMonth];
        }
        else {
            const dailyMessages = [
                ["Hari baru, semangat baru!", "Jangan ragu untuk mencoba!"],
                ["Fokus dan terus maju!", "Setiap langkah adalah kemajuan."],
                ["Bangkit dan bergerak!", "Hari ini adalah kesempatan!"],
                ["Kerja keras hari ini!", "Hasil luar biasa nanti!"],
                ["Jangan berhenti berusaha!", "Kesuksesan menanti di depan."],
                ["Peluang besar menunggu!", "Ambil setiap kesempatan!"],
                ["Berpikir positif, hasil positif!", "Lakukan dengan penuh semangat!"],
                ["Setiap detik berharga!", "Manfaatkan waktu sebaik-baiknya!"],
                ["Jangan takut gagal!", "Kegagalan adalah langkah menuju sukses!"],
                ["Terus berjuang, pantang menyerah!", "Sukses ada di ujung usaha!"],
                ["Percaya pada diri sendiri!", "Kamu bisa mengatasi segala rintangan!"],
                ["Hari ini, lebih baik dari kemarin!", "Tunjukkan yang terbaik!"]
            ];
            const dailyMessage = dailyMessages[(currentDay - 1) % dailyMessages.length];
            message.push(dailyMessage[0], dailyMessage[1]);
        } 
    }
    return message;
}
