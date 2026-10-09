/* =====================================================================
   CHAPTER TWO · content.js
   ---------------------------------------------------------------------
   ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA ĐỂ ĐỔI CHỮ, NGÀY, ẢNH, NHẠC, VIDEO.

   Quy tắc nhỏ để không bị lỗi:
   1. Chỉ sửa chữ nằm GIỮA hai dấu ngoặc kép "...".
   2. Giữ nguyên dấu phẩy , ở cuối mỗi dòng và sau mỗi khối { ... }.
   3. Muốn THÊM một mục (mốc timeline, ảnh, lý do, câu quiz...):
      copy nguyên một khối { ... }, dán ngay bên dưới, rồi sửa chữ.
   4. Muốn BỚT: xoá nguyên khối { ... } kèm dấu phẩy ngay sau nó.
   5. Trong chữ nếu cần dấu ngoặc kép thì dùng “ ” hoặc ' ' thay cho ".
   6. Chỗ nào ghi [MẪU] là nội dung viết sẵn, bạn sửa lại theo ý mình.
   ===================================================================== */

window.CONTENT = {

  /* ---------- Thông tin chung ---------- */
  couple: {
    him: "Quang Thắng",
    her: "Hương Lan",
    himNick: "Anhiuuu",
    herNick: "Embeiuuu",
    seal: "T♥L"                       // chữ trên dấu sáp của thiệp
  },

  // Ngày giờ theo giờ Việt Nam (+07:00). Đừng đổi định dạng nha.
  dates: {
    start: "2024-10-20T00:00:00+07:00",          // ngày chính thức quen nhau
    anniversary: "2026-10-20T00:00:00+07:00",    // kỉ niệm 2 năm
    nextAnniversary: "2027-10-20T00:00:00+07:00" // kỉ niệm 3 năm (đếm ngược + mở hộp thư)
  },

  // Chữ hiện thay cho ảnh/video khi chưa có file
  placeholderText: "Ảnh của mình ở đây",
  videoPlaceholderText: "Video của mình ở đây",

  /* ---------- Nhạc nền ---------- */
  music: {
    src: "music/background.mp3",
    volume: 0.5                                  // 0 → 1
  },

  /* =====================================================================
     1. THIỆP MỞ ĐẦU + CÂU HỎI MẬT KHẨU
     ===================================================================== */
  intro: {
    brand: "Thắng ♥ Lan",
    coverKicker: "Our love diary",
    coverTitle: "Chapter Two",
    coverSub: "Hai năm · 20.10",
    tapHint: "Chạm để mở",

    question: "Đố iem biết Anh đã nói 'Yêu iemmm' bao nhiêu lần trong suốt thời gian quen nhau?",
    // Các đáp án được chấp nhận. Web tự bỏ dấu, bỏ khoảng trắng, bỏ / - . nên
    // "20/10", "20-10", "20.10", "2010" đều tính là đúng.
    answers: ["Trên 1 triệu lần", "1 triệu","trên 1 triệu lần"],
    placeholder: "Nhập câu trả lời nè…",
    submitLabel: "Mở thiệp",
    hint: "Con số thiệt sự là to lắm đó 😁",
    hintLabel: "Gợi ý nhỏ:",
    wrongMessages: [
      "Hông đúng rồi bạn iu ơi 🥺",
      "Ơ kìa, ny hông biếc thiệt hả? Dỗi xíu đó nha 😤",
      "Sai nữa là anh buồn thiệt á… 🥲",
      "Nghĩ kỹ lại coi, Con số to lắm lắm 🌧️",
      "Gần đúng rồi đó, cố lên Embe ơi 💪"
    ],
    rightMessage: "Hehe đúng ròi! Iu Embe của anh vcl💗",

    // Trang trái bên trong thiệp
    leftPage: {
      photo: "photos/intro.jpg",
      photoAlt: "Thắng và Lan",
      quote: "Chương 1 là gặp được nhau. Chương 2 là chọn nhau, mỗi ngày.",
      by: "— Anhiuuu"
    },
    // Trang phải bên trong thiệp
    rightPage: {
      kicker: "Chapter 2 · p.00",
      greeting: "Gửi Embeiuuu,",
      text: "Một năm trước anh làm tặng bạn một cái web kỉ niệm. Năm nay tụi mình viết tiếp nè, sang Chương 2 rồi đó. Bạn đã sẵn sàng lật trang chưa? 🥰",
      sign: "Anhiuuu",
      button: "Bước vào Chương 2 ❤️"
    }
  },

  /* =====================================================================
     2. HERO (trang đầu)
     ===================================================================== */
  hero: {
    kicker: "Our love diary",
    title: "Chapter Two",
    subtitle: "Hai năm bên nhau",
    dateRange: "20.10.2024 – 20.10.2026",
    lead: "Năm đầu là những lần đầu tiên. Năm thứ hai là những lần “vẫn là nhau”. Lật từ từ thôi nha, trang nào cũng có bạn trong đó hết á.", // [MẪU]
    photo: "photos/hero.jpg",
    photoAlt: "Ảnh đôi của Thắng và Lan",
    photoCaption: "us · year two",
    scrollLabel: "Lật trang",

    // Lời chúc 20/10 nhỏ cho Lan
    womensDay: {
      title: "Happy 20/10 🌷",
      text: "Hôm nay vừa là ngày của tụi mình, vừa là ngày của bạn. Chúc người phụ nữ anh thương luôn được dịu dàng, luôn được cưng, và luôn cười xinhhh như vầy nha.",
      sign: "— Anhiuuu"
    }
  },

  /* =====================================================================
     3. TOGETHER — bộ đếm thời gian
     ===================================================================== */
  together: {
    title: "Together",
    sub: "Chúng mình đã bên nhau được",
    since: "kể từ 20.10.2024",
    units: ["ngày", "giờ", "phút", "giây"],
    todayLine: "Hôm nay là ngày thứ {n} của tụi mình nè 💞",   // {n} sẽ tự thay bằng số
    countdownTitle: "Đếm ngược tới kỉ niệm 3 năm",
    countdownDate: "20.10.2027",
    countdownDone: "Tới kỉ niệm 3 năm rồi nè! Chương 3 bắt đầu thôi 🎉"
  },

  /* =====================================================================
     4. CHAPTER ONE — nhìn lại năm 1
     ===================================================================== */
  chapterOne: {
    title: "Chapter One",
    sub: "Nhìn lại chương đầu tiên",
    intro: "Sáu khoảnh khắc mở đầu mọi thứ. Đọc lại vẫn thấy tim đập nhanh quá nà.",
    url: "https://thang3107.github.io/ThangLan_1st-year_Anniversary/",
    button: "Đọc lại Chương 1 →",
    moments: [
      { date: "19.10.2024", emoji: "💬", title: "Buổi gặp mặt nói chuyện đầu tiên", text: "Từ 5h30 chiều tới tận 12h đêm, nói hoài hông hết chuyện. Trộm vía hợp nhau quá trời." },
      { date: "20.10.2024", emoji: "🌧️", title: "Dính mưa rồi đắm luôn", text: "Ngày chính thức quen nhau. Mưa to dữ lắm mà hai đứa vẫn ướt cùng nhau, 2 đứa chịu đau quá dữ kkk." },
      { date: "10.01.2025", emoji: "🌲", title: "Chuyến đi đầu tiên · Đà Lạt", text: "Lạnh vãi, lần đầu tiên đi xa cùng nhau." },
      { date: "14.02.2025", emoji: "💝", title: "Valentine đầu tiên", text: "Đúng ngày bạn vào Sài Gòn, năm đầu tiên yêu xa 1 tháng." },
      { date: "30.04.2025", emoji: "🎆", title: "Ra mắt nhà Dì & xem pháo hoa", text: "Run muốn xỉu mà dui, tối đó còn được ngắm pháo hoa cùng nhau lần đầu." },
      { date: "26.07.2025", emoji: "🌊", title: "Biển Thạnh An", text: "Chuyến này đi chơi nhẹ nhàng, một ngày bình yên hết sức." }
    ]
  },

    /* =====================================================================
     5. OUR JOURNEY — timeline năm 2
     photo: để "" nếu mốc đó không có ảnh
     Chỗ nào ghi "dd.mm" là mình chưa biết ngày chính xác, bạn điền giúp nha.
     ===================================================================== */
  journey: {
    title: "Our Journey",
    sub: "Năm thứ hai của chúng mình",
    items: [
      { date: "Tháng 10.2025", emoji: "🎂", title: "Anni 1 năm", text: "Tròn một năm bên nhau, cuốn nhật ký đầu tiên ra đời. Anh ngồi code tới khuya mà thấy em cười là hết mệt liền.", photo: "photos/journey-01.jpg" },
      { date: "Tháng 11.2025", emoji: "🏖️", title: "Phước Hải cùng anh chị và mọi người", text: "Lần đầu đi biển đông vui cả đám. Nắng, gió, hải sản, và một tấm ảnh nhóm ai cũng nhắm mắt hehe.", photo: "photos/journey-02.jpg" },
      { date: "Tháng 12.2025", emoji: "📸", title: "Bộ ảnh Giáng sinh & Năm mới đầu tiên", text: "Lần đầu tụi mình chụp hẳn một bộ ảnh đôi. Tạo dáng muốn gãy lưng mà ra ảnh đẹp quá nà, trộm vía.", photo: "photos/journey-03.jpg" },
      { date: "Tháng 12.2025", emoji: "🎄", title: "Giáng sinh thứ hai cùng nhau", text: "Đèn nhấp nháy, nhạc Giáng sinh, và một bàn tay để nắm khi đi dạo phố. Ấm hơn cả áo khoác luôn.", photo: "photos/journey-04.jpg" },
      { date: "01–02.01.2026", emoji: "🎁", title: "Năm mới & sinh nhật Em bé", text: "Vừa đếm ngược đón năm mới xong là tới sinh nhật Em bé. Hai ngày liền ăn mừng, dui muốn xỉu.", photo: "photos/journey-05.jpg" },
      { date: "Tháng 01.2026", emoji: "🌲", title: "Đà Lạt lần thứ hai", text: "Quay lại nơi chuyến đi đầu tiên bắt đầu. Vẫn lạnh, vẫn thông xanh, chỉ khác là tụi mình thương nhau nhiều hơn rồi.", photo: "photos/journey-06.jpg" },
      { date: "Tháng 01-03.2026", emoji: "🥺", title: "Rồi bước vào iu xa tiếp lun", text: "Lại xa nhau mấy trăm cây số. Nhớ thì gọi video, buồn thì nhắn liền. Xa mặt chứ hông xa lòng nha.", photo: "photos/journey-07.jpg" },
      { date: "Tháng 03.2026", emoji: "🌷", title: "8/3 nè hehe", text: "Ở xa mà vẫn phải lo quà cho Em bé đầy đủ. Ngày của em thì phải được cưng nhiều nhất chứ.", photo: "photos/journey-08.jpg" },
      { date: "Tháng 04.2026", emoji: "🌊", title: "Vũng Tàu đầu năm + Anni 18 tháng", text: "Chuyến Vũng Tàu đầu tiên trong năm, đúng dịp một năm rưỡi bên nhau. Gặp lại sau mấy tháng iu xa nên ôm hoài hông muốn buông.", photo: "photos/journey-09.jpg" },
      { date: "Tháng 06.2026", emoji: "☁️", title: "Đà Lạt lần nữa trong năm", text: "Một năm mà lên Đà Lạt hai lần, chắc thành người Đà Lạt luôn quá. Lần nào đi với em cũng thấy mới.", photo: "photos/journey-10.jpg" },
      { date: "Tháng 09.2026", emoji: "🇻🇳", title: "Lễ 2/9 nè", text: "Nghỉ lễ là phải gặp nhau liền. Mấy ngày ngắn ngủi mà vui bằng cả tháng.", photo: "photos/journey-11.jpg" },
      { date: "Tháng 09.2026", emoji: "🏮", title: "Trung Thu lun", text: "Lồng đèn, bánh trung thu, và người thương bên cạnh. Trăng tròn mà mình cũng tròn đầy ghê.", photo: "photos/journey-12.jpg" }
    ]
  },

  /* =====================================================================
     6. BY THE NUMBERS
     value có thể là số (8) hoặc số kèm chữ ("Hơn 1000", "300+"):
     web sẽ cho phần số chạy từ 0 lên, phần chữ giữ nguyên. — con số  [MẪU]
     auto: "days" → web tự tính số ngày bên nhau, khỏi điền value
     ===================================================================== */
  numbers: {
    title: "By The Numbers",
    sub: "Hai năm qua những con số",
    items: [
      { emoji: "📅", auto: "days", label: "ngày bên nhau", note: "và còn đếm tiếp dài dài" },
      { emoji: "🧳", value: 8, suffix: "", label: "chuyến đi cùng nhau", note: "Đà Lạt vẫn là số 1" },
      { emoji: "📸", value: "Hơn 1000", suffix: "", label: "tấm ảnh chụp iem trong máy", note: "bạn chọn tấm đăng mất 30 phút" },
      { emoji: "🧋", value: "300+", suffix: "", label: "ly nước ép", note: "ít đường, nhiều tình cảm cụa anh" },
      { emoji: "🥺", value: 17, suffix: "", label: "lần giận rồi làm lành", note: "lần nào cũng làm lành trước khi ngủ( à thực ra là có 1 lần để qua tận hôm sau)" },
      { emoji: "🛵", value: 2468, suffix: " km", label: "đã đi cùng nhau", note: "ngồi sau ôm eo là chính" }
    ]
  },

  /* =====================================================================
     7. OUR MEMORIES — gallery polaroid
     Ảnh để trong thư mục photos/. Thêm ảnh: copy 1 dòng, đổi tên file & chú thích.
     ===================================================================== */
  gallery: {
    title: "Our Memories",
    sub: "Những khoảnh khắc đẹp nhất",
    photos: [
      { src: "photos/01.jpg", caption: "Sáng sớm Đà Lạt lần hai" },
      { src: "photos/02.jpg", caption: "Noel năm nay lạnh xíu" },
      { src: "photos/03.jpg", caption: "Sinh nhật Embe 🎂" },
      { src: "photos/04.jpg", caption: "Tết Bính Ngọ" },
      { src: "photos/05.jpg", caption: "Valentine thứ hai" },
      { src: "photos/06.jpg", caption: "Chuyến đi của năm" },
      { src: "photos/07.jpg", caption: "Cười hông thấy tổ quốc" },
      { src: "photos/08.jpg", caption: "Một chiều bình thường mà dui" }
    ]
  },

  // Khung so sánh "Year One vs Year Two"
  compare: {
    title: "Year One vs Year Two",
    sub: "Cùng một dáng, khác một năm",
    hint: "Kéo thanh ở giữa sang trái phải nha",
    before: { src: "photos/compare/year1.jpg", label: "Năm 1", alt: "Ảnh năm thứ nhất" },
    after:  { src: "photos/compare/year2.jpg", label: "Năm 2", alt: "Ảnh năm thứ hai" },
    caption: "Khác mỗi kiểu tóc thôi, còn thương thì y chang, à không, nhiều hơn 🤭"
  },

  /* =====================================================================
     8. REASONS I LOVE YOU — 20 thẻ lật  [MẪU]
     Nên viết mỗi lý do ngắn (dưới ~75 ký tự) để vừa thẻ trên điện thoại.
     ===================================================================== */
  reasons: {
    title: "Reasons I Love You",
    sub: "20 lý do anh thương em",
    hint: "Chạm vào thẻ để lật nha (máy tính thì rê chuột)",
    label: "Lý do",
    list: [
      "Vì em cười một cái là cả ngày của anh rất nhiều năng lượng.",
      "Vì em nhớ hết mấy chuyện nhỏ xíu anh từng kể.",
      "Vì em dỗi cũng đáng yêu, mà làm lành cũng nhanh.",
      "Vì em dễ ăn dễ chịu kkk",
      "Vì đi đâu có em cũng thành chuyến đi vui nhất.",
      "Vì em tin anh, kể cả lúc anh chưa tin chính mình.",
      "Vì giọng em lúc buồn ngủ dễ thương hết nấc.",
      "Vì em chịu nghe anh nói nhảm tới khuya.",
      "Vì em dịu dàng với cả người em chưa quen.",
      "Vì em anh có thể chụp cho iem nhiều hình xinh:)))",
      "Vì em mạnh mẽ hơn em nghĩ nhiều lắm.",
      "Vì ở cạnh em, anh được là chính mình.",
      "Vì em anh sẽ được cho em miếng anh ngon nhất.",
      "Vì em làm anh muốn thành người tốt hơn.",
      "Vì em làm cho anh luôn nắm tay.",
      "Vì em, anh nhớ từng lời anh hứa, đang cố gắng thực hiện",
      "Vì mắt em cong cong mỗi lần cười.",
      "Vì em là người đầu tiên anh muốn kể mọi chuyện.",
      "Vì hai năm rồi mà gặp em anh vẫn dui dẻ.",
      "Vì là em. Vậy thôi là đủ rồi 💗"
    ]
  },

  /* =====================================================================
     9. FROM YOU & ME — hai lá thư  [MẪU]
     paragraphs: mỗi dòng "..." là một đoạn văn.
     ===================================================================== */
  letters: {
    title: "From You & Me",
    sub: "Những lời yêu thương gửi nhau",
    hint: "Bấm vào phong bì để mở thư",
    items: [
      {
        label: "Thư của Anhiuuu",
        to: "Gửi Embeiuuu",
        greeting: "Embeiuuu của anh,",
        paragraphs: [
          "Hai năm rồi đó, nhanh ghê. Mới hôm nào còn ngồi nhắn tin từ chiều tới nửa đêm, giờ thì tụi mình đã có cả một cuốn nhật ký dày cộm.",
          "Năm nay có những ngày vui muốn bay lên, cũng có mấy ngày giận nhau mặt nặng mày nhẹ. Nhưng anh thích và mong nhất là ngày nào kết thúc cũng còn câu “Chúc anh ngủ ngonnn” của em.",
          "Cảm ơn em vì đã kiên nhẫn với anh, vì đã cười với mấy trò nhây của anh, và vì đã chọn anh thêm một năm nữa.",
          "Chương 3 tụi mình viết tiếp nha. Anh hứa sẽ cố gắng nhiều hơn, thương em nhiều hơn nữa (nếu còn chỗ để thương thêm hehe)."
        ],
        sign: "Anhiuuu"
      },
      {
        label: "Thư của Embeiuuu",
        to: "Gửi Anhiuuu",
        greeting: "Emiuuu ơi,",
        paragraphs: [
          "Lại là như năm ngoái, iem tự điền cái này nha"
        ],
        sign: "Embeiuuu"
      }
    ]
  },

  /* =====================================================================
     10. QUIZ — How well do you know me?  [MẪU]
     answer: số thứ tự đáp án đúng, ĐẾM TỪ 0 (đáp án đầu tiên là 0).
     ===================================================================== */
  quiz: {
    title: "How Well Do You Know Me?",
    sub: "Hiểu nhau tới đâu",
    intro: "6 câu thôi, trả lời thiệt lòng nha. Sai là bị phạt ôm hun lận đó 😆",
    questionLabel: "Câu",
    nextLabel: "Câu tiếp theo →",
    resultLabel: "Xem kết quả 💌",
    retryLabel: "Làm lại từ đầu ↺",
    scoreLabel: "Điểm của bạn",
    questions: [
      {
        q: "Món nào anh có thể ăn cả tuần không chán?",
        options: ["Cơm tấm", "Bún bò", "Mì cay", "Phở"],
        answer: 1,
        right: "Chuẩn không cần chỉnh! Hiểu anh nhất luôn 🍚",
        wrong: "Ơ kìa, anh mê cơm tấm mà 🥲"
      },
      {
        q: "Câu anh nhắn cho em nhiều nhất là gì?",
        options: ["Iem ăn gì chưa?", "Anh đi rồi bé nhan :)))", "Iu iem vcl", "Tất cả các câu trên"],
        answer: 3,
        right: "Đúng rồi, ngày nào cũng đủ combo 😌",
        wrong: "Gần đúng á, nhưng mà anh nhắn hết luôn đó 🤭"
      },
      {
        q: "Buổi nói chuyện đầu tiên, tụi mình nói chuyện tới mấy giờ?",
        options: ["9h tối", "10h30 tối", "12h đêm", "2h sáng"],
        answer: 2,
        right: "Nhớ dai ghê! Từ 5h30 chiều tới 12h đêm luôn 🌙",
        wrong: "Hông phải nha, tận 12h đêm lận đó 🌙"
      },
      {
        q: "Anh sợ nhất điều gì?",
        options: ["Gián bay", "Em giận", "Hết pin điện thoại", "Đi trễ"],
        answer: 1,
        right: "Chính xác, gián bay còn đỡ hơn 😨",
        wrong: "Cái đó cũng sợ, mà sợ nhất là em giận á 🥺"
      },
      {
        q: "Anh thích nhất khoảnh khắc nào khi ở cạnh em?",
        options: ["Lúc đi ăn", "Lúc em cười", "Lúc chụp ảnh", "Lúc em ngủ gật"],
        answer: 1,
        right: "Đúng rồi, em cười, chính xác là rất thích nhìn iem cười kkk 😍",
        wrong: "Cũng dễ thương, nhưng lúc em cười mới là số 1 😍"
      },
      {
        q: "Năm thứ 3 quen nhau, đâu là điều anh mong muốn nhất",
        options: ["Cưới iem :>", "Đi du lịch Hà Gianggg", "Hai đứa thấu hiểu, chia sẻ nhiều hơn", "Khác, chọn cái này thì ngồi nghe anh tâm sự ehhe"],
        answer: 3,
        right: "Câu này dễ mà đúng hông 😚",
        wrong: "Đi đâu cũng được hết á, quan trọng là có em 😚"
      }
    ],
    // Lời nhắn theo điểm (min = điểm tối thiểu để hiện lời nhắn này)
    results: [
      { min: 6, title: "Hiểu anh hơn cả anh 😳", text: "Full điểm luôn! Thưởng một cái ôm thật chặt với một ly nước ép nhe." },
      { min: 4, title: "Giỏi quá nà 🥰", text: "Sai xíu xiu thôi, năm 3 anh dạy thêm cho, học phí là một cái hun." },
      { min: 2, title: "Hmm… cần hẹn hò bù 🤭", text: "Vậy là phải đi chơi nhiều hơn nữa để hiểu nhau thêm rồi. Hẹn em cuối tuần nha." },
      { min: 0, title: "Dỗi thật đó nha 😤", text: "Làm lại liền cho anh! Lần này anh nhắm mắt làm ngơ nếu em nhìn gợi ý." }
    ]
  },

  /* =====================================================================
     11. OUR DREAMS — ước mơ
     status: "done" = Đã làm được · "going" = Đang trên đường · "next" = Chờ năm sau  [MẪU]
     ===================================================================== */
  dreams: {
    title: "Our Dreams",
    sub: "Những ước mơ của chúng mình",
    statusLabels: { done: "Đã làm được", going: "Đang trên đường", next: "Chờ năm sau" },
    items: [
      { emoji: "🏡", title: "Ngôi nhà nhỏ", text: "Một góc có cửa sổ đầy nắng, một con mèo lười và hai cái cốc giống nhau.", status: "next" },
      { emoji: "✈️", title: "Du lịch thế giới", text: "Đi hết những nơi đã lưu trong Tiktok, chụp ảnh ở mỗi nơi một tấm polaroid.", status: "going" },
      { emoji: "👨‍👩‍👧", title: "Gia đình nhỏ", text: "Ấm áp, nhiều tiếng cười và bữa cơm tối lúc nào cũng có nhau.", status: "next" },
      { emoji: "💼", title: "Sự nghiệp vững", text: "Cùng cố gắng, cùng lên level, cùng ăn mừng mỗi lần được tăng lương.", status: "going" },
      { emoji: "🌱", title: "Cùng nhau phát triển", text: "Mỗi năm tốt hơn năm trước một chút, và luôn là đồng đội của nhau.", status: "done" },
      { emoji: "♾️", title: "Mãi bên nhau", text: "Chương 2 xong rồi, còn chương 3, 4, 5… viết hoài không hết.", status: "going" }
    ],
    next: {
      title: "Next Chapter",
      sub: "Mục tiêu năm 3",
      goals: [
        "Đi một chuyến nước ngoài đầu tiên cùng nhau",
        "Học nấu 5 món ngon để nấu cho nhau ăn",
        "Mỗi tháng một buổi hẹn hò “đúng nghĩa”",
        "Tiết kiệm chung một quỹ nhỏ cho ngôi nhà mơ ước",
        "Bớt giận vặt, làm lành nhanh hơn nữa",
        "Chụp thêm thật nhiều ảnh cho web kỉ niệm 3 năm",
        "Iem muốn điền thêm gì hemmm"
      ],
      foot: "Làm xong mục nào thì chạm vào để tick nha, năm sau tụi mình đếm lại 💪"
    }
  },

  /* =====================================================================
     12. TIME CAPSULE — thư gửi tương lai (tự mở vào ngày nextAnniversary)
     Muốn xem thử trước: thêm ?preview=capsule vào cuối đường link.
     ===================================================================== */
  capsule: {
    title: "Time Capsule",
    sub: "Hộp thư gửi tương lai",
    lockedText: "Lá thư này được niêm phong tới kỉ niệm 3 năm. Ráng đợi thêm xíu nha, đọc sớm là mất linh đó 🤫",
    unlockedText: "Tới ngày rồi! Hộp thư từ năm 2026 đã mở khoá 💌",
    dateLabel: "Mở vào 20.10.2027",
    lockedButton: "🔒 Chưa tới ngày đâu nè",
    lockedToast: "Còn chưa tới ngày mà, kiên nhẫn xíu nha 🤭",
    openButton: "Mở thư từ quá khứ 💌",
    letter: {
      label: "Thư từ năm 2026",
      greeting: "Gửi tụi mình của năm 2027,",  // [MẪU]
      paragraphs: [
        "Nếu đang đọc được dòng này thì tụi mình đã đi qua thêm 365 ngày nữa rồi. Giỏi quá nà!",
        "Không biết năm đó tụi mình đã đi được nước ngoài chưa, đã nấu được món nào ra hồn chưa, đã bớt giận vặt chưa. Mà chưa cũng không sao hết.",
        "Chỉ mong lúc mở thư này, hai đứa vẫn đang ngồi cạnh nhau, vẫn cười mấy chuyện cũ, và vẫn thương nhau nhiều như lúc viết thư."
      ],
      sign: "Thắng & Lan của năm 2026"
    }
  },

  /* =====================================================================
     13. FOOTER
     ===================================================================== */
  footer: {
    pageLabel: "Chapter 2 · the last page",
    closing: "Chương 2 khép lại ở đây, nhưng câu chuyện của tụi mình thì còn dài lắm. Hẹn em ở Chương 3 nha ❤️",
    sign: "— Anhiuuu & Embeiuuu",
    madeWith: "Made with ❤️ for our 2nd anniversary · 20.10.2024 – 20.10.2026",
    eggHint: "Psst… có 5 mảnh tim đang trốn trong trang này 👀",
    replayLabel: "🎬 Xem lại món quà nhỏ",
    toTopLabel: "Về trang đầu ↑"
  },

  /* =====================================================================
     14. EASTER EGG — 5 mảnh tim bí mật → video
     spots: vị trí giấu mảnh tim (đếm từ 1)
     ===================================================================== */
  secret: {
    spots: {
      journey: 4,     // mảnh ở mốc timeline thứ 4
      reason: 13      // mảnh ở góc thẻ lý do số 13
      // 3 mảnh còn lại luôn nằm ở: góc bộ đếm (Together), tờ "Next Chapter" (Our Dreams) và footer
    },
    // Tên khu vực hiện trong gợi ý khi bấm vào huy hiệu trái tim ở góc trái
    areas: {
      1: "Together",
      2: "Our Journey",
      3: "Our Dreams",
      4: "Reasons I Love You",
      5: "Footer"
    },
    foundToast: "Tìm thấy 1 mảnh tim bí mật! Còn {left} mảnh nữa. Bấm trái tim góc trái để xem gợi ý nha 👀",
    lastToast: "Đủ 5 mảnh rồiii! Có quà nè 🎁",
    badgeToast: "Đã tìm được {n}/5 mảnh. Còn trốn ở: {where} 👀",
    assembleText: "Trái tim đã lành lặn rồi nè",
    title: "A Little Secret",
    sub: "Một món quà nhỏ",
    note: "Bạn tìm đủ 5 mảnh tim rồi đó. Đây là món quà anh giấu kỹ nhất 💗",

    video: {
      type: "file",                       // "file" (video trong máy) hoặc "youtube"
      src: "video/special.mp4",           // dùng khi type là "file"
      poster: "photos/video-poster.jpg",  // ảnh bìa video (không bắt buộc)
      id: ""                              // ID YouTube khi type là "youtube", ví dụ "dQw4w9WgXcQ"
    }
  }
};
