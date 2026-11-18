export type JointId = 'butt' | 'tee' | 'corner' | 'lap' | 'edge';

export interface AnatomyZone {
  id: 'base_metal' | 'weld_metal' | 'haz' | 'weld_root' | 'weld_toe';
  nameMn: string;
  nameEn: string;
  description: string;
  temperatureNote: string;
}

export interface WeldJointInfo {
  id: JointId;
  code: string;
  nameMn: string;
  nameEn: string;
  shortDesc: string;
  summary: string;
  strengthRating: string;
  thicknessRange: string;
  recommendedGrooves: string[];
  applications: string[];
  pros: string;
  cons: string;
}

export type GrooveTypeId = 'square' | 'single_v' | 'double_v' | 'single_u' | 'bevel';

export interface GrooveTypeInfo {
  id: GrooveTypeId;
  code: string;
  nameMn: string;
  nameEn: string;
  recommendedThickness: string;
  minThickness: number;
  maxThickness: number;
  defaultAngle: number;
  defaultGap: number;
  defaultRootFace: number;
  description: string;
  applicationNote: string;
}

export type FilletProfileId = 'flat' | 'convex' | 'concave';

export interface FilletProfileInfo {
  id: FilletProfileId;
  nameMn: string;
  nameEn: string;
  stressBehavior: string;
  bestUse: string;
  caution: string;
}

export type WeldPositionId = 'PA' | 'PB' | 'PC' | 'PF' | 'PG' | 'PE';

export interface WeldPositionInfo {
  id: WeldPositionId;
  awsCode: string;
  nameMn: string;
  nameEn: string;
  difficulty: 'Хялбар' | 'Дунд' | 'Хүнд' | 'Маш хүнд';
  gravityEffect: string;
  electrodeAngle: string;
  currentAdjustment: string;
  plateAngleDeg: number;
  isFillet: boolean;
  description: string;
  techniqueTip: string;
}

export interface QuizQuestion {
  id: number;
  category: 'Холболтын төрөл' | 'Ирмэг засал ба Огтлол' | 'Байрлал' | 'Зургийн тэмдэглэгээ';
  prompt: string;
  diagramType:
    | 'joint_butt'
    | 'joint_tee'
    | 'joint_lap'
    | 'joint_corner'
    | 'joint_edge'
    | 'groove_x'
    | 'groove_v'
    | 'fillet_throat'
    | 'symbol_fillet_both'
    | 'position_pe';
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedStage: 1 | 2 | 3;
}

export interface PracticalScenario {
  id: string;
  title: string;
  taskDescription: string;
  constraints: string[];
  expectedJoint: JointId;
  expectedGroove: GrooveTypeId | 'fillet';
  expectedPosition: WeldPositionId;
  successNote: string;
  hint: string;
}

export const ANATOMY_ZONES: AnatomyZone[] = [
  {
    id: 'base_metal',
    nameMn: 'Үндсэн металл',
    nameEn: 'Base Metal',
    description:
      'Гагнах гэж буй анхны эд ангийн хайлаагүй, бүтэц нь өөрчлөгдөөгүй металлын үндсэн хэсэг.',
    temperatureNote: '20°C – 500°C (Бүтэц хэвээр)',
  },
  {
    id: 'weld_metal',
    nameMn: 'Оёоны металл (Хайлсан бүс)',
    nameEn: 'Weld Metal',
    description:
      'Электродын нэмэлт металл болон үндсэн металлын ирмэг хамт хайлж, царцан нэгэн цул болж тогтсон бүс.',
    temperatureNote: '1500°C+ (Шингэн төлөвөөс царцсан)',
  },
  {
    id: 'haz',
    nameMn: 'Дулааны нөлөөллийн бүс (ДНБ)',
    nameEn: 'Heat-Affected Zone (HAZ)',
    description:
      'Хайлаагүй боловч гагнуурын өндөр дулааны нөлөөгөөр талст бүтэц болон механик шинж чанар нь өөрчлөгдсөн зэргэлдээ бүс.',
    temperatureNote: '723°C – 1450°C (Фазын хувирал)',
  },
  {
    id: 'weld_root',
    nameMn: 'Оёоны уг (Ёроол)',
    nameEn: 'Weld Root',
    description:
      'Оёоны доод гүнд үндсэн хоёр металл хамгийн ойр нийлж хайлсан хэсэг. Бүрэн нэвчилт энд шийдэгддэг.',
    temperatureNote: 'Хүчдэл төвлөрөх чухал цэг',
  },
  {
    id: 'weld_toe',
    nameMn: 'Оёоны хөл (Ирмэгийн зааг)',
    nameEn: 'Weld Toe',
    description:
      'Оёоны гадаргуу үндсэн металлын гадаргуутай нийлж буй зааг шугам. Огцом шилжилт эсвэл ухлаас (undercut) үүсэхээс сэргийлнэ.',
    temperatureNote: 'Цуцалтын ан цав эхлэх эрсдэлтэй цэг',
  },
];

export const WELD_JOINTS: WeldJointInfo[] = [
  {
    id: 'butt',
    code: 'С1 – С25 (ISO 9692)',
    nameMn: 'Тулгасан холболт',
    nameEn: 'Butt Joint',
    shortDesc: 'Хоёр эд ангийг нэг хавтгайд ирмэгээр нь тулгаж гагнах',
    summary:
      'Хоёр металл хавтан буюу хоолойг нэг хавтгайд төгсгөлөөр нь өөд өөдөөс нь тулгаж холбох хамгийн түгээмэл бөгөөд бат бөх холболт.',
    strengthRating: 'Өндөр — Суналт, шахалт, доргилтод тэсвэртэй',
    thicknessRange: '1.5 мм – 60+ мм',
    recommendedGrooves: ['I-хэлбэр (зузаан ≤ 4 мм)', 'V-хэлбэр (4–16 мм)', 'X-хэлбэр (> 16 мм)'],
    applications: [
      'Даралтат сав, уурын зуухны их бие',
      'Хий, газрын тос дамжуулах гол шугам хоолой',
      'Гүүр, краны гол дам нурууны залгаас',
    ],
    pros: 'Хүчдэл жигд тархдаг, материалын зарцуулалт бага, рентген болон хэт авианы шалгалтад тохиромжтой.',
    cons: 'Эд ангийн ирмэгийг нарийн засаж тааруулах, угсралтын завсрыг жигд барих шаардлагатай.',
  },
  {
    id: 'tee',
    code: 'Т1 – Т11 (ISO 9692)',
    nameMn: 'Таврын (Т-хэлбэрийн) холболт',
    nameEn: 'Tee Joint (T-Joint)',
    shortDesc: 'Нэг эд ангийн ирмэгийг нөгөөгийн гадаргууд 90° тулгах',
    summary:
      'Нэг хавтанг нөгөө хавтангийн хавтгай гадаргууд перпендикуляраар (Т үсгийн хэлбэрээр) тулгаж булангийн эсвэл ховилын оёогоор холбоно.',
    strengthRating: 'Дунд–Өндөр — Хоёр талын оёо эсвэл бүрэн нэвчилтээр өснө',
    thicknessRange: '2 мм – 40 мм',
    recommendedGrooves: ['Хоёр талын булангийн оёо', 'Нэг талын налуу (Bevel)', 'К-хэлбэрийн ирмэг засал'],
    applications: [
      'Барилгын ган каркас, I-дам нуруу угсрах',
      'Машин механизмын тулгуур суурь, раам',
      'Хөлөг онгоцны их бие ба хавирган бэхэлгээ',
    ],
    pros: 'Ирмэг засалгүйгээр хурдан угсрах боломжтой, огтлолын хөшүүн чанар маш сайн.',
    cons: 'Нэг талын оёо тавихад нугалах ачаалалд уг хэсгээр сул байдаг тул ихэвчлэн хоёр талаас гагнана.',
  },
  {
    id: 'corner',
    code: 'У1 – У10 (ISO 9692)',
    nameMn: 'Булангийн холболт',
    nameEn: 'Corner Joint',
    shortDesc: 'Хоёр эд ангийг ирмэгээр нь өнцөг үүсгэн L хэлбэрээр нийлүүлэх',
    summary:
      'Хоёр хуудас буюу хавтангийн ирмэгүүдийг 90° (эсвэл 30°–135°) өнцгөөр L хэлбэр үүсгэн нийлүүлж гадна эсвэл дотор талд нь оёо тавина.',
    strengthRating: 'Дунд — Хайрцаг хэлбэрийн хийцэд тохиромжтой',
    thicknessRange: '1.5 мм – 25 мм',
    recommendedGrooves: ['Гадна булангийн ховил', 'Нээлттэй булан (Open corner)', 'Хаалттай булан'],
    applications: [
      'Дөрвөлжин хайрцаг, цахилгааны шүүгээ, корпус',
      'Тэгш өнцөгт суваг, агааржуулалтын хоолой',
      'Хүрээ ба танк резервуарын булангууд',
    ],
    pros: 'Нэмэлт ирмэг засал бага шаардана, гагнуурын урсгал хялбар, гадна буланг өнгөлж тэгшлэх боломжтой.',
    cons: 'Дотор талаас оёо тавих боломжгүй хаалттай хайрцагт дутуу нэвчилт үүсэх магадлалтай.',
  },
  {
    id: 'lap',
    code: 'Н1 – Н2 (ISO 9692)',
    nameMn: 'Зөрүүлсэн холболт',
    nameEn: 'Lap Joint',
    shortDesc: 'Хоёр эд ангийн ирмэгийг давхцуулан тавьж булангийн оёогоор холбох',
    summary:
      'Нэг хавтанг нөгөө хавтан дээр тодорхой өргөнтэйгөөр давхцуулан (зөрүүлж) тавьж, хоёр талын ирмэг дээр булангийн оёо тавина.',
    strengthRating: 'Дунд — Шилжилтийн хүчинд тэсвэртэй, экцентриситеттэй',
    thicknessRange: '1 мм – 16 мм',
    recommendedGrooves: ['Давхар булангийн оёо', 'Нүхэлсэн (Plug) оёо', 'Цэгэн оёо'],
    applications: [
      'Өөр өөр зузаантай нимгэн хуудас металл залгах',
      'Засварын нөхөөс хавтан бэхлэх',
      'Автомашины их бие болон хөнгөн хийц',
    ],
    pros: 'Ирмэг төгс тааруулах шаардлагагүй, угсралтад хамгийн хялбар, цоорч гэмтэх магадлал бага.',
    cons: 'Металл давхарласнаас жин ба зардал нэмэгдэнэ; давхцсан завсарт чийг орж зэврэх эрсдэлтэй.',
  },
  {
    id: 'edge',
    code: 'ТЦ / Edge (ISO 9692)',
    nameMn: 'Ирмэгийн (Захын) холболт',
    nameEn: 'Edge Joint',
    shortDesc: 'Зэрэгцээ байрлах хоёр хуудасны захын ирмэгийг дагуулан гагнах',
    summary:
      'Хоёр зэрэгцээ металл хуудас эсвэл матагдсан фланцын ирмэгийг зэрэгцүүлэн тавьж, дээд захаар нь оёо тавьж битүүмжилнэ.',
    strengthRating: 'Бага — Голдуу битүүмжлэл болон бага ачаалалд',
    thicknessRange: '0.8 мм – 6 мм',
    recommendedGrooves: ['Ирмэгийн оёо (Edge weld)', 'U эсвэл V ирмэгийн ховил'],
    applications: [
      'Дуу намсгагч, радиатор, нимгэн савны фланц битүүмжлэл',
      'Хуудас металл бүрээсийн захыг нийлүүлэх',
      'Трансформаторын хайрцагны дээд ирмэг',
    ],
    pros: 'Нимгэн хуудсыг цоололгүйгээр хурдан битүүмжилдэг, ихэвчлэн нэмэлт утасгүйгээр (TIG) гүйцэтгэнэ.',
    cons: 'Даралт эсвэл гулзайлтын өндөр ачаалал даахгүй; уг хэсгээр задрах хандлагатай тул даацын хийцэд хориглоно.',
  },
];

export const GROOVE_TYPES: GrooveTypeInfo[] = [
  {
    id: 'square',
    code: 'I-хэлбэр',
    nameMn: 'Шулуун ирмэгтэй (I-оёо)',
    nameEn: 'Square Groove',
    recommendedThickness: '1.5 – 4 мм (хоёр талаас ≤ 8 мм)',
    minThickness: 2,
    maxThickness: 6,
    defaultAngle: 0,
    defaultGap: 1.5,
    defaultRootFace: 0,
    description:
      'Ирмэгийг ямар ч налуугүй шулуун зүсэж, завсаргүй буюу бага завсартай тулгаж гагнана.',
    applicationNote: 'Нимгэн хуудас болон бага даацын хийцэд хамгийн хэмнэлттэй.',
  },
  {
    id: 'single_v',
    code: 'V-хэлбэр',
    nameMn: 'Нэг талын V-ирмэг засал',
    nameEn: 'Single-V Groove',
    recommendedThickness: '5 – 20 мм',
    minThickness: 5,
    maxThickness: 20,
    defaultAngle: 60,
    defaultGap: 2.0,
    defaultRootFace: 1.5,
    description:
      'Хоёр хавтангийн дээд ирмэгийг тус бүр 25°–30° (нийлбэр 50°–60°) налуулан засаж, угийн мохоолт үлдээнэ.',
    applicationNote: 'Дунд зузаантай хавтан болон хоолойд нэг талаас бүрэн нэвчихэд стандарт сонголт.',
  },
  {
    id: 'double_v',
    code: 'X-хэлбэр',
    nameMn: 'Хоёр талын X-ирмэг засал',
    nameEn: 'Double-V Groove',
    recommendedThickness: '14 – 40 мм',
    minThickness: 12,
    maxThickness: 30,
    defaultAngle: 60,
    defaultGap: 2.0,
    defaultRootFace: 2.0,
    description:
      'Дээд ба доод хоёр талаас налуулж засна. V-оёотой харьцуулахад нэмэлт металл 2 дахин бага орж, муруйлт тэнцвэржинэ.',
    applicationNote: 'Хоёр талаас нь гагнах боломжтой зузаан хавтанд хамгийн тохиромжтой.',
  },
  {
    id: 'single_u',
    code: 'U-хэлбэр',
    nameMn: 'U-хэлбэрийн ирмэг засал',
    nameEn: 'Single-U Groove',
    recommendedThickness: '18 – 50 мм',
    minThickness: 14,
    maxThickness: 30,
    defaultAngle: 25,
    defaultGap: 2.0,
    defaultRootFace: 2.0,
    description:
      'Фрезер эсвэл токариар дугуйрсан ёроолтой нарийн ховил гаргана. Зузаан металлд электрод бага зарцуулна.',
    applicationNote: 'Өндөр хариуцлагатай зузаан ханатай даралтат саванд хэрэглэнэ.',
  },
  {
    id: 'bevel',
    code: 'V/2 (Налуу)',
    nameMn: 'Нэг талын хагас налуу',
    nameEn: 'Single-Bevel Groove',
    recommendedThickness: '6 – 20 мм',
    minThickness: 6,
    maxThickness: 22,
    defaultAngle: 45,
    defaultGap: 2.0,
    defaultRootFace: 1.5,
    description:
      'Зөвхөн нэг эд ангийн ирмэгийг 45° налуулж, нөгөө эд ангийг шулуун үлдээнэ. Ихэвчлэн Т-холболт ба буланд ашиглана.',
    applicationNote: 'Таврын холболтод бүрэн нэвчилттэй оёо авах үед өргөн хэрэглэгддэг.',
  },
];

export const FILLET_PROFILES: FilletProfileInfo[] = [
  {
    id: 'flat',
    nameMn: 'Тэгш (Хэвийн) профиль',
    nameEn: 'Flat / Miter Fillet',
    stressBehavior: 'Хүчдэл жигд дамжина, катет ба тооцоот өндөр (a = 0.707·K) оновчтой харьцаатай.',
    bestUse: 'Ихэнх стандарт ган хийц, дам нуруу, статик ачаалалтай зангилаа.',
    caution: 'Оёоны хөл хэсэгт ухлаас (undercut) гаргахгүй байх шаардлагатай.',
  },
  {
    id: 'convex',
    nameMn: 'Гүдгэр профиль',
    nameEn: 'Convex Fillet',
    stressBehavior: 'Оёоны хөлийн өнцөг огцом тул давтагдах (доргионы) ачаалалд ирмэгээр ан цав үүсэх эрсдэлтэй.',
    bestUse: 'Бага гүйдлээр тавьсан босоо/таазны оёо эсвэл статик шахалтын бүс.',
    caution: 'Илүүдэл металл зарцуулалт өндөр, хэт гүдгэр бол хайлалт дутаж болно.',
  },
  {
    id: 'concave',
    nameMn: 'Хотгор профиль',
    nameEn: 'Concave Fillet',
    stressBehavior: 'Үндсэн металл руу маш зөөлөн шилждэг тул цуцалт болон чичиргээнд хамгийн тэсвэртэй.',
    bestUse: 'Динамик ачаалалтай гүүр, кран, машины рам, эргэлдэх эд анги.',
    caution: 'Голын хэсэг хэт нарийсвал тооцоот өндөр (a) багасаж даац буурах аюултай тул шаблоноор хэмжинэ.',
  },
];

export const WELD_POSITIONS: WeldPositionInfo[] = [
  {
    id: 'PA',
    awsCode: '1G / 1F',
    nameMn: 'Доод байрлал',
    nameEn: 'Flat Position',
    difficulty: 'Хялбар',
    gravityEffect: 'Таталцлын хүч хайлсан металлыг оёоны ховил руу жигд суулгаж өгнө.',
    electrodeAngle: 'Ажлын өнцөг 90°, хөдөлгөөний өнцөг 70°–80° арагш налуулна',
    currentAdjustment: 'Суурь гүйдэл 100% (Бүтээмж хамгийн өндөр)',
    plateAngleDeg: 0,
    isFillet: false,
    description:
      'Гагнаж буй эд анги хэвтээ байрлаж, гагнуурчин дээрээс нь доош харж гүйцэтгэдэг хамгийн тохиромжтой байрлал.',
    techniqueTip: 'Том диаметртэй электрод, өндөр гүйдэл ашиглаж гүн нэвчилт авч болно.',
  },
  {
    id: 'PB',
    awsCode: '2F',
    nameMn: 'Доод булангийн байрлал',
    nameEn: 'Horizontal Fillet',
    difficulty: 'Дунд',
    gravityEffect: 'Босоо ханаас хайлш доош гулсах хандлагатай тул доод хавтан руу анхаарна.',
    electrodeAngle: 'Хоёр хавтгайн дунд 45°, хэвтээ хөдөлгөөнд 75°–80°',
    currentAdjustment: 'Суурь гүйдлийн 95%–100%',
    plateAngleDeg: 0,
    isFillet: true,
    description:
      'Босоо болон хэвтээ хавтангийн уулзварт булангийн оёог хэвтээ чиглэлд тавих байрлал.',
    techniqueTip: 'Электродыг босоо ханаас арай бага зайтай барьж доод талын катет тэгш гаргуулна.',
  },
  {
    id: 'PC',
    awsCode: '2G',
    nameMn: 'Хэвтээ байрлал',
    nameEn: 'Horizontal Butt',
    difficulty: 'Хүнд',
    gravityEffect: 'Шингэн ванн таталцлаар доод ирмэг рүү урсаж, дээд ирмэгт ухлаас үлдээх эрсдэлтэй.',
    electrodeAngle: 'Хэвтээ хавтгайд дээш 5°–15° өргөж барина',
    currentAdjustment: 'Доод байрлалаас 10%–15% багасгана',
    plateAngleDeg: 90,
    isFillet: false,
    description:
      'Босоо байрласан хана буюу хоолойн гадаргуу дээр оёоны тэнхлэг хэвтээ чиглэлд явах байрлал.',
    techniqueTip: 'Богино нум барьж, дээд ирмэгийг дүүргэн шаталсан нарийн үеэр явна.',
  },
  {
    id: 'PF',
    awsCode: '3G / 3F (Up)',
    nameMn: 'Босоо — Дээш өгсөх',
    nameEn: 'Vertical Up',
    difficulty: 'Хүнд',
    gravityEffect: 'Хайлш доош гоожих тул доод хөрсөн оёо тавиур болж дээш шаталж өгнө.',
    electrodeAngle: 'Хэвтээ шугамаас 10°–15° доош налуулж (дээш түлхэнэ)',
    currentAdjustment: 'Доод байрлалаас 15%–20% багасгана',
    plateAngleDeg: 90,
    isFillet: false,
    description:
      'Босоо ханан дээр доороос дээш чиглүүлэн гагнах. Зузаан металлд гүн нэвчилт ба өндөр бат бөх өгнө.',
    techniqueTip: 'Гурвалжин буюу "ёлка" хөдөлгөөнөөр хажуу ирмэгт түр саатаж голоор нь хурдан өнгөрнө.',
  },
  {
    id: 'PG',
    awsCode: '3G / 3F (Down)',
    nameMn: 'Босоо — Доош уруудах',
    nameEn: 'Vertical Down',
    difficulty: 'Дунд',
    gravityEffect: 'Хайлсан металл ба шаар нумын урдуур доош гүйж нэвчилтийг бууруулдаг.',
    electrodeAngle: 'Электродыг дээш 15°–30° өргөж уруудаж татна',
    currentAdjustment: 'Целлюлоз электродоор хурдан хөдөлгөөн хийнэ',
    plateAngleDeg: 90,
    isFillet: false,
    description:
      'Дээрээс доош хурдан уруудан гагнах. Нимгэн хуудас (≤ 4 мм) болон магистраль хоолойн эхний үед ашиглана.',
    techniqueTip: 'Шаар урдуур орж гацахгүй байх хурдыг яг тааруулах нь чухал.',
  },
  {
    id: 'PE',
    awsCode: '4G / 4F',
    nameMn: 'Таазны (Дээд) байрлал',
    nameEn: 'Overhead Position',
    difficulty: 'Маш хүнд',
    gravityEffect: 'Таталцлын хүч шууд гагнуурчин руу доош татах тул жижиг ванн үүсгэх ёстой.',
    electrodeAngle: 'Гадаргууд ойр 80°–85° босоодуу, богино нум',
    currentAdjustment: 'Доод байрлалаас 15%–25% багасгана',
    plateAngleDeg: 180,
    isFillet: false,
    description:
      'Толгойн дээр байрлах эд ангийн доод гадаргуугаас гагнах хамгийн их ур чадвар шаардсан байрлал.',
    techniqueTip: 'Маш богино нум барьж (цахилгаан гадаргуугийн таталцал шингэн дуслыг тогтооно), хамгаалах хувцсаа нягтална.',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Холболтын төрөл',
    prompt: 'Зураг дээрх хоёр эд ангийг нэг хавтгайд ирмэгээр нь өөд өөдөөс нь тулгасан холболтыг юу гэж нэрлэдэг вэ?',
    diagramType: 'joint_butt',
    options: [
      'Зөрүүлсэн холболт (Lap joint)',
      'Тулгасан холболт (Butt joint)',
      'Таврын холболт (Tee joint)',
      'Ирмэгийн холболт (Edge joint)',
    ],
    correctIndex: 1,
    explanation:
      'Хоёр хавтанг нэг хавтгайд ирмэгээр нь тулгаж холбохыг Тулгасан холболт (Butt joint) гэнэ. Хүчдэл жигд дамжуулдаг тул хамгийн бат бөх холболт юм.',
    relatedStage: 1,
  },
  {
    id: 2,
    category: 'Холболтын төрөл',
    prompt: 'Дараах огтлолд үзүүлсэн зэрэгцээ хуудаснуудын захын ирмэгийг нийлүүлж гагнасан холболт аль нь вэ?',
    diagramType: 'joint_edge',
    options: [
      'Булангийн холболт (Corner joint)',
      'Таврын холболт (Tee joint)',
      'Ирмэгийн холболт (Edge joint)',
      'Зөрүүлсэн холболт (Lap joint)',
    ],
    correctIndex: 2,
    explanation:
      'Ирмэгийн холболт (Edge joint) нь зэрэгцээ хоёр нимгэн хуудсыг захын ирмэгээр нь битүүмжилж гагнахад ашиглагддаг бөгөөд өндөр ачаалалд зориулагдаагүй.',
    relatedStage: 1,
  },
  {
    id: 3,
    category: 'Ирмэг засал ба Огтлол',
    prompt: '20 мм зузаантай хавтанг хоёр талаас нь гагнах үед нэмэлт металл ба муруйлтыг 2 дахин бууруулах аль ирмэг засал тохиромжтой вэ?',
    diagramType: 'groove_x',
    options: [
      'Шулуун I-хэлбэрийн ирмэг',
      'Нэг талын V-хэлбэрийн ирмэг',
      'Хоёр талын X-хэлбэрийн ирмэг',
      'Ирмэгийн оёо',
    ],
    correctIndex: 2,
    explanation:
      'X-хэлбэрийн хоёр талын ирмэг засал (Double-V) нь зузаан металлд нэг талын V-ээс хамаагүй бага дүүргэгч металл шаардаж, дулааны хэв гажилтыг тэнцвэржүүлдэг.',
    relatedStage: 2,
  },
  {
    id: 4,
    category: 'Ирмэг засал ба Огтлол',
    prompt: 'Зурагт үзүүлсэн тэгш булангийн оёоны катет K = 10 мм бол оёоны тооцоот өндөр (throat thickness, a) хэдэн мм байх вэ?',
    diagramType: 'fillet_throat',
    options: ['5.0 мм', '7.07 мм', '10.0 мм', '14.1 мм'],
    correctIndex: 1,
    explanation:
      'Тэгш хөлтэй булангийн оёоны тооцоот өндөр a = K × sin(45°) = 0.707 × K томьёогоор бодогдоно. K = 10 мм үед a ≈ 7.07 мм байна.',
    relatedStage: 2,
  },
  {
    id: 5,
    category: 'Ирмэг засал ба Огтлол',
    prompt: '8 мм зузаан ган хавтанг ирмэг засалгүйгээр (I-оёо) завсаргүй тулгаад бага гүйдлээр гагнавал ямар гэмтэл гарах магадлал хамгийн өндөр вэ?',
    diagramType: 'groove_v',
    options: [
      'Дутуу нэвчилт (Incomplete penetration)',
      'Цоорч урсах (Burn-through)',
      'Булангийн хөл томдох',
      'Цахилгаан нум тасрахгүй байх',
    ],
    correctIndex: 0,
    explanation:
      '4–5 мм-ээс зузаан хавтанд V эсвэл X ирмэг засал хийхгүй бол нум оёоны ёроолд хүрэхгүй Дутуу нэвчилт үүсэж даац огцом унадаг.',
    relatedStage: 2,
  },
  {
    id: 6,
    category: 'Байрлал',
    prompt: 'Хайлсан металл таталцлын хүчээр шууд доош дусах хандлагатай тул гүйдлийг 15–25% бууруулж маш богино нум барьдаг байрлал аль нь вэ?',
    diagramType: 'position_pe',
    options: ['Доод байрлал (PA / 1G)', 'Доод булан (PB / 2F)', 'Хэвтээ байрлал (PC / 2G)', 'Таазны байрлал (PE / 4G)'],
    correctIndex: 3,
    explanation:
      'Таазны байрлал (PE / 4G) үед хайлш таталцлаар доош урсдаг тул гагнуурын ванныг жижиг байлгахын тулд гүйдлийг багасгаж богино нум барина.',
    relatedStage: 3,
  },
  {
    id: 7,
    category: 'Зургийн тэмдэглэгээ',
    prompt: 'ISO 2553 зургийн түлхүүр шугам дээр гурвалжин тэмдэг нь үндсэн шугамын ДЭЭД ба ДООД хоёр талд хоёуланд нь байвал юу гэсэн үг вэ?',
    diagramType: 'symbol_fillet_both',
    options: [
      'Зөвхөн сум заасан талд V-оёо тавина',
      'Т-холболтын хоёр талд хоёуланд нь булангийн оёо тавина',
      'Бүхэлд нь эргэн тойрон тасралтгүй гагнана',
      'Угсралтын талбайд гагнана',
    ],
    correctIndex: 1,
    explanation:
      'ISO 2553 (болон AWS) стандартаар түлхүүр шугамын доорх тэмдэг нь сум заасан талыг, дээрх тэмдэг нь эсрэг талыг заана. Хоёр талд гурвалжин байвал давхар булангийн оёо тавина.',
    relatedStage: 3,
  },
  {
    id: 8,
    category: 'Холболтын төрөл',
    prompt: 'Доргилт ба гулзайлтын эсрэг Т-хэлбэрийн холболтыг илүү бат бөх болгохын тулд ямар арга хэмжээ авдаг вэ?',
    diagramType: 'joint_tee',
    options: [
      'Зөвхөн нэг талд гүдгэр оёо тавих',
      'Хоёр талд нь хотгор/тэгш булангийн оёо тавих эсвэл ирмэгийг нь налуу засах',
      'Ирмэгийн оёогоор солих',
      'Завсрыг 8 мм болгож ихэсгэх',
    ],
    correctIndex: 1,
    explanation:
      'Таврын (Т) холболтыг хоёр талаас нь гагнах эсвэл босоо хавтангийн ирмэгийг К/налуу зассанаар бүрэн нэвчилт авч гулзайлтын бат бөхийг нэмэгдүүлдэг.',
    relatedStage: 1,
  },
  {
    id: 9,
    category: 'Холболтын төрөл',
    prompt: 'Өөр өөр зузаантай нимгэн хавтанг ирмэг нарийн тааруулахгүйгээр хурдан угсарч гагнахад аль холболт хамгийн тохиромжтой вэ?',
    diagramType: 'joint_lap',
    options: [
      'Тулгасан холболт (Butt)',
      'Зөрүүлсэн холболт (Lap)',
      'Ирмэгийн холболт (Edge)',
      'X-оёо',
    ],
    correctIndex: 1,
    explanation:
      'Зөрүүлсэн холболт (Lap joint) нь хавтангуудыг давхцуулж тавьдаг тул ирмэгийн зүсэлтийн хүлцэлд бага мэдрэг, угсрахад хялбар.',
    relatedStage: 1,
  },
  {
    id: 10,
    category: 'Холболтын төрөл',
    prompt: 'Дөрвөлжин ган хайрцаг ба агааржуулалтын сувгийн булангуудыг 90°-аар нийлүүлэхэд голчлон ямар холболт ашиглах вэ?',
    diagramType: 'joint_corner',
    options: [
      'Булангийн холболт (Corner joint)',
      'Зөрүүлсэн холболт (Lap joint)',
      'Ирмэгийн холболт (Edge joint)',
      'Хэвтээ Т-холболт',
    ],
    correctIndex: 0,
    explanation:
      'Хоёр хавтанг L-хэлбэртэй 90° өнцгөөр нийлүүлдэг Булангийн холболт нь хайрцаг, шүүгээ, тэгш өнцөгт хоолой угсрах үндсэн төрөл юм.',
    relatedStage: 1,
  },
];

export const PRACTICAL_SCENARIOS: PracticalScenario[] = [
  {
    id: 'pipe_butt',
    title: 'Даалгавар 1: Магистраль шугам хоолойн залгаас',
    taskDescription:
      '12 мм зузаантай нүүрстөрөгчит ган хоолойн төгсгөлүүдийг нэг тэнхлэгт тулган, гадна талаас нь бүрэн нэвчилттэй даацын оёогоор холбох шаардлагатай.',
    constraints: ['Зузаан: 12 мм', 'Хүртээмж: Зөвхөн гадна талаас', 'Шаардлага: 100% бүрэн нэвчилт'],
    expectedJoint: 'butt',
    expectedGroove: 'single_v',
    expectedPosition: 'PA',
    successNote: 'Зөв шийдэл! 12 мм зузаантай нэг талын хүртээмжтэй тулгасан холболтод V-хэлбэрийн ирмэг засал ба эргүүлж гагнах доод (PA) байрлал хамгийн оновчтой.',
    hint: 'Нэг хавтгайд тулгаж буй тул Тулгасан холболт, зузаан нь 5–20 мм учир V-ирмэг засал сонгоорой.',
  },
  {
    id: 'beam_tee',
    title: 'Даалгавар 2: Гүүрний тулгуур Т-дам нуруу',
    taskDescription:
      'Хэвтээ суурь хавтан дээр босоо тулгуур хавтанг 90° перпендикуляраар байрлуулж хоёр талаас нь булангийн оёогоор гагнана.',
    constraints: ['Зузаан: 10 мм', 'Хэлбэр: Босоо + Хэвтээ хавтан', 'Гагнах байрлал: Булангийн хэвтээ'],
    expectedJoint: 'tee',
    expectedGroove: 'fillet',
    expectedPosition: 'PB',
    successNote: 'Маш сайн! Т-хэлбэрийн холболтыг хэвтээ суурь дээр булангийн оёогоор (PB байрлал) гагнах нь үйлдвэрлэлийн стандарт горим юм.',
    hint: 'Энэ бол Таврын (Т) холболт. Оёоны хэлбэр нь булангийн оёо, байрлал нь PB байна.',
  },
  {
    id: 'thick_plate',
    title: 'Даалгавар 3: 24 мм зузаан хавтанг хоёр талаас залгах',
    taskDescription:
      '24 мм зузаантай хүнд даацын ган хавтангуудыг тулгаж залгана. Хоёр талаас нь эргүүлж гагнах боломжтой бөгөөд муруйлтыг хамгийн бага байлгах хэрэгтэй.',
    constraints: ['Зузаан: 24 мм', 'Хүртээмж: Дээд ба доод хоёр тал', 'Зорилго: Муруйлт ба электрод хэмнэх'],
    expectedJoint: 'butt',
    expectedGroove: 'double_v',
    expectedPosition: 'PA',
    successNote: 'Төгс тохиргоо! 24 мм зузаан хавтанг хоёр талаас гагнах үед X-хэлбэрийн ирмэг засал хийснээр дулааны гажилтыг тэнцвэржүүлнэ.',
    hint: 'Хоёр талаас гагнах зузаан хавтанд V-ээс илүү X-хэлбэрийн ирмэг засал тохиромжтой.',
  },
  {
    id: 'overhead_repair',
    title: 'Даалгавар 4: Таазны доорх давхцуулсан нөхөөс',
    taskDescription:
      'Дээврийн ган хучилтын доод талд буюу толгойн дээр 4 мм зузаантай бэхэлгээний хавтанг үндсэн хавтан дээр давхцуулан булангийн оёогоор тогтооно.',
    constraints: ['Зузаан: 4 мм', 'Арга: Давхцуулж тавих', 'Байрлал: Толгойн дээр (таазанд)'],
    expectedJoint: 'lap',
    expectedGroove: 'fillet',
    expectedPosition: 'PE',
    successNote: 'Зөв шийдэл! Давхцуулж тавьсан нь Зөрүүлсэн холболт, толгойн дээрээс гагнах нь Таазны (PE) байрлал юм.',
    hint: 'Давхцуулсан угсралт = Зөрүүлсэн холболт; толгойн дээр = Таазны байрлал (PE).',
  },
];
