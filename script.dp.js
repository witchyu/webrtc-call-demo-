// สร้าง Peer Object โดยใช้ Public Server ฟรีของ PeerJS
const peer = new Peer();

let localStream;
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const myIdSpan = document.getElementById('my-id');
const callBtn = document.getElementById('call-btn');
const callIdInput = document.getElementById('call-id');

// 1. เปิดกล้องและไมโครโฟนของเราเองทันทีเมื่อเข้าเว็บ
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
    })
    .catch(err => {
        console.error('ไม่สามารถเปิดกล้อง/ไมโครโฟนได้', err);
        alert('กรุณาอนุญาตให้ใช้งานกล้องและไมโครโฟน');
    });

// 2. เมื่อเชื่อมต่อกับ PeerJS Server สำเร็จ จะได้ ID ของเรามา
peer.on('open', (id) => {
    myIdSpan.innerText = id;
    console.log('My Peer ID is: ' + id);
});

// 3. กดปุ่มเพื่อโทรหาเพื่อน
callBtn.addEventListener('click', () => {
    const friendId = callIdInput.value.trim();
    if (!friendId) {
        alert('กรุณากรอก ID ของเพื่อนก่อน');
        return;
    }

    console.log('กำลังโทรหา: ' + friendId);
    // ส่ง Stream ของเราไปหาเพื่อน
    const call = peer.call(friendId, localStream);

    call.on('stream', (remoteStream) => {
        // เมื่อเพื่อนกดรับสายและส่งภาพกลับมา ให้แสดงผลที่จอฝั่งขวา
        remoteVideo.srcObject = remoteStream;
    });

    call.on('close', () => {
        alert('สายถูกตัดแล้ว');
    });
});

// 4. รอรับสายเมื่อมีคนอื่นโทรเข้ามาหาเรา
peer.on('call', (call) => {
    if (confirm('มีสายเรียกเข้า! ต้องการรับสายหรือไม่?')) {
        // ตอบรับสายและส่ง Stream ของเรากลับไปหาเขาด้วย
        call.answer(localStream);

        call.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
    } else {
        call.close();
    }
});
