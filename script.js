// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current date in footer
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Hide loading screen after 1.5 seconds (simulate loading)
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);

    // Initialize the map centered on Tripoli
    const map = L.map('map', {
        zoomControl: false,
        preferCanvas: true
    }).setView([34.4367, 35.8497], 15);

    // Add zoom control with custom position
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add locate control
    L.control.locate({
        position: 'topright',
        strings: {
            title: "Show me where I am",
            popup: "You are within {distance} {unit} from this point"
        },
        locateOptions: {
            maxZoom: 16
        }
    }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Add a subtle gradient overlay to the map
    const gradientOverlay = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        opacity: 0.3,
        maxZoom: 19
    }).addTo(map);

    // Custom marker creation function
    function createCustomMarker(type) {
        const markerHtml = `<div class="custom-marker marker-${type}"></div>`;
        return L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        });
    }

    // Arabic translations
    const translations = {
        en: {
            title: "Welcome to My Neighborhood in Tripoli",
            subtitle: "Explore the places around my home in Lebanon's second largest city",
            searchPlaceholder: "Search places...",
            allCategories: "All Categories",
            weatherTitle: "Current Weather",
            legendTitle: "Map Legend",
            createdBy: "Created with",
            by: "by a Computer Engineering Student",
            lastUpdated: "Last updated:",
            categories: {
                home: "Home",
                telecom: "Telecom",
                retail: "Retail",
                abandoned: "Abandoned",
                sport: "Sports",
                coffeeshop: "Coffee Shops",
                health: "Health",
                company: "Company"
            },
            weatherLoading: "Loading weather data...",
            noResults: "No locations found matching your search.",
            popupFooter: "Click outside to close"
        },
        ar: {
            title: "مرحبًا بكم في حيي في طرابلس",
            subtitle: "استكشف الأماكن حول منزلي في ثاني أكبر مدينة في لبنان",
            searchPlaceholder: "ابحث عن أماكن...",
            allCategories: "جميع الفئات",
            weatherTitle: "الطقس الحالي",
            legendTitle: "مفتاح الخريطة",
            createdBy: "تم إنشاؤه بـ",
            by: "من قبل طالب هندسة حاسوب",
            lastUpdated: "آخر تحديث:",
            categories: {
                home: "المنزل",
                telecom: "الاتصالات",
                retail: "التجزئة",
                abandoned: "مهجور",
                sport: "الرياضة",
                coffeeshop: "مقاهي",
                health: "الصحة",
                company: "شركة"
            },
            weatherLoading: "جاري تحميل بيانات الطقس...",
            noResults: "لا توجد أماكن تطابق بحثك.",
            popupFooter: "انقر خارج النافذة للإغلاق"
        }
    };

    // Current language
    let currentLang = 'en';

    // Function to translate the page
    function translatePage(lang) {
        currentLang = lang;
        const t = translations[lang];
        
        // Update UI elements
        document.querySelector('header h1').textContent = t.title;
        document.querySelector('.subtitle').textContent = t.subtitle;
        document.getElementById('search-input').placeholder = t.searchPlaceholder;
        document.querySelector('.sidebar-header h2').textContent = t.title.split(' ').slice(3).join(' ');
        document.querySelector('.weather-container h3').textContent = t.weatherTitle;
        document.querySelector('.legend-container h3').textContent = t.legendTitle;
        document.querySelector('footer p').innerHTML = `${t.createdBy} <i class="fas fa-heart"></i> ${t.by}`;
        document.querySelector('.last-updated').textContent = t.lastUpdated;
        
        // Update category filter options
        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.innerHTML = `
            <option value="all">${t.allCategories}</option>
            <option value="home">${t.categories.home}</option>
            <option value="telecom">${t.categories.telecom}</option>
            <option value="retail">${t.categories.retail}</option>
            <option value="abandoned">${t.categories.abandoned}</option>
            <option value="sport">${t.categories.sport}</option>
            <option value="coffeeshop">${t.categories.coffeeshop}</option>
            <option value="health">${t.categories.health}</option>
        `;
        
        // Update weather loading text
        const weatherLoading = document.querySelector('.weather-loading span');
        if (weatherLoading) weatherLoading.textContent = t.weatherLoading;
        
        // Update legend items
        const legendItems = document.querySelectorAll('.legend-item span');
        if (legendItems.length > 0) {
            legendItems[0].textContent = t.categories.home;
            legendItems[1].textContent = t.categories.telecom;
            legendItems[2].textContent = t.categories.retail;
            legendItems[3].textContent = t.categories.sport;
            legendItems[4].textContent = t.categories.coffeeshop;
            legendItems[5].textContent = t.categories.health;
            legendItems[6].textContent = t.categories.company;
        }
        
        // Set RTL if Arabic
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
        }
        
        // Rebuild location list
        buildLocationList(currentFilter, currentSearch);
    }

    // Language switcher event listeners
    document.getElementById('lang-en').addEventListener('click', () => {
        document.getElementById('lang-en').classList.add('active');
        document.getElementById('lang-ar').classList.remove('active');
        translatePage('en');
    });

    document.getElementById('lang-ar').addEventListener('click', () => {
        document.getElementById('lang-ar').classList.add('active');
        document.getElementById('lang-en').classList.remove('active');
        translatePage('ar');
    });

    // Sample locations data
    const locations = [
        {
            id: 1,
            name: { en: "My House", ar: "منزلي" },
            type: "home",
            coordinates: [34.444623842039846, 35.83180441337012],
            description: { 
                en: "This is where I live in Tripoli.", 
                ar: "هذا هو المكان الذي أعيش فيه في طرابلس." 
            },
            image: "home.jpg",
            details: {
                en: {
                    "Built": "1995",
                    "Rooms": "4 bedrooms, 2 bathrooms",
                    "Features": "Garden, Garage, Balcony"
                },
                ar: {
                    "Built": "1995",
                    "Rooms": "4 غرف نوم، حمامين",
                    "Features": "حديقة، كراج، شرفة"
                }
            }
        },
        {
            id: 2,
            name: { en: "Ogero - Tripoli Branch", ar: "أوجيرو - فرع طرابلس" },
            type: "telecom",
            coordinates: [34.44410918051168, 35.82468299347877],
            description: { 
                en: "Official Ogero point of presence in Tripoli, offering customer support and bill payment services.", 
                ar: "النقطة الرسمية لأوجيرو في طرابلس، تقدم دعم العملاء وخدمات دفع الفواتير." 
            },
            image: "ogero.jpg",
            details: {
                en: {
                    "Opening Hours": "Mon - Thu: 8:00 AM - 4:00 PM",
                    "Customer Support": "1515 (Daily 8:00 AM - 10:00 PM)",
                    "Social Media": `<a href="https://www.facebook.com/OgeroTelecom" target="_blank">Facebook</a><br><a href="https://twitter.com/Ogero_Telecom" target="_blank">Twitter</a><br><a href="https://www.instagram.com/ogerotelecom/" target="_blank">Instagram</a><br><a href="https://www.ogero.gov.lb" target="_blank">Official Website</a>`
                },
                ar: {
                    "Opening Hours": "الإثنين - الخميس: 8:00 صباحًا - 4:00 مساءً",
                    "Customer Support": "1515 (يوميًا من 8:00 صباحًا إلى 10:00 مساءً)",
                    "Social Media": `<a href="https://www.facebook.com/OgeroTelecom" target="_blank">فيسبوك</a><br><a href="https://twitter.com/Ogero_Telecom" target="_blank">تويتر</a><br><a href="https://www.instagram.com/ogerotelecom/" target="_blank">إنستغرام</a><br><a href="https://www.ogero.gov.lb" target="_blank">الموقع الرسمي</a>`
                }
            }
        },
        {
            id: 3,
            name: { en: "Connext ISP - Tripoli Branch", ar: "كونيكست - فرع طرابلس" },
            type: "telecom",
            coordinates: [34.44502143477773, 35.82215871962969],
            description: { 
                en: "Local internet service provider in Tripoli offering high-speed fiber and DSL connections, with customer support and bill payment services.", 
                ar: "مزود خدمة إنترنت محلي في طرابلس يقدم اتصالات عالية السرعة بالألياف والدي إس إل، مع دعم العملاء وخدمات دفع الفواتير." 
            },
            image: "connext.jpeg",
            details: {
                en: {
                    "Opening Hours": "Mon–Fri: 8:00 AM – 4:00 PM",
                    "Customer Support": "Call +96181638555",
                    "Social Media": `<a href="https://www.facebook.com/connextisp" target="_blank">Facebook</a><br><a href="https://connext-lb.net/" target="_blank">Official Website</a>`
                },
                ar: {
                    "Opening Hours": "الإثنين–الجمعة: 8:00 صباحًا – 4:00 مساءً",
                    "Customer Support": "اتصل بـ +96181638555",
                    "Social Media": `<a href="https://www.facebook.com/connextisp" target="_blank">فيسبوك</a><br><a href="https://connext-lb.net/" target="_blank">الموقع الرسمي</a>`
                }
            }
        },
        {
            id: 4,
            name: { en: "Bloom Authentic outlet-tripoli", ar: "بلوم أوثنتيك - طرابلس" },
            type: "retail",
            coordinates: [34.44311405371401, 35.82550892450103],
            description: { 
                en: "Local online retail shop offering household appliances, electronics, and more in Tripoli.", 
                ar: "متجر بيع بالتجزئة محلي عبر الإنترنت يقدم الأجهزة المنزلية والإلكترونيات والمزيد في طرابلس." 
            },
            image: "bloom.png",
            details: {
                en: {
                    "Opening Hours": "Mon–Sat: 9:00 AM – 9:00 PM",
                    "Contact": "79163520",
                    "Social Media": "Not listed"
                },
                ar: {
                    "Opening Hours": "الإثنين–السبت: 9:00 صباحًا – 9:00 مساءً",
                    "Contact": "79163520",
                    "Social Media": "غير مدرج"
                }
            }
        },
        {
            id: 5,
            name: { en: "Tripoli Train Station", ar: "محطة قطار طرابلس" },
            type: "abandoned",
            coordinates: [34.44899713394901, 35.82521621261985],
            description: { 
                en: "An iconic yet abandoned train station reflecting Lebanon's forgotten rail era.", 
                ar: "محطة قطار أيقونية ولكن مهجورة تعكس عصر السكك الحديدية المنسي في لبنان." 
            },
            image: "train.png",
            details: {
                en: {
                    "Status": "Abandoned",
                    "Historic Value": "Built in the 1910s, once connected to Syria and Beirut.",
                    "Featured In": `<a href='https://www.reuters.com/article/us-lebanon-railways-idUSKCN1VV0I6' target='_blank'>Reuters: Lebanon's Lost Railways</a>`
                },
                ar: {
                    "Status": "مهجور",
                    "Historic Value": "بُنيت في العقد 1910، كانت تربط سوريا وبيروت.",
                    "Featured In": `<a href='https://www.reuters.com/article/us-lebanon-railways-idUSKCN1VV0I6' target='_blank'>رويترز: سكك حديد لبنان المفقودة</a>`
                }
            }
        },
        {
            id: 6,
            name: { en: "Rachid Karami International Fair", ar: "معرض رشيد كرامي الدولي" },
            type: "abandoned",
            coordinates: [34.43756289491443, 35.82385940546655],
            description: { 
                en: "Designed by Oscar Niemeyer, now listed among endangered modernist sites.", 
                ar: "صممه أوسكار نيماير، مدرج الآن بين المواقع الحداثية المهددة بالخطر." 
            },
            image: "karami.png",
            details: {
                en: {
                    "Architect": "Oscar Niemeyer",
                    "Built": "1960s",
                    "Featured In": `<a href='https://whc.unesco.org/en/list/1702/' target='_blank'>Architectural Digest</a>`
                },
                ar: {
                    "Architect": "أوسكار نيماير",
                    "Built": "الستينيات",
                    "Featured In": `<a href='https://whc.unesco.org/en/list/1702/' target='_blank'>أركيتيكشورال دايجست</a>`
                }
            }
        },
        {
            id: 7,
            name: { en: "Tripoli Municipal Stadium", ar: "ملعب طرابلس البلدي" },
            type: "sport",
            coordinates: [34.44483792096934, 35.836437512269974],
            description: { 
                en: "Main football stadium in Tripoli hosting local matches and sports events.", 
                ar: "الملعب الرئيسي لكرة القدم في طرابلس يستضيف المباريات المحلية والفعاليات الرياضية." 
            },
            image: "football feild.png",
            details: {
                en: {
                    "Capacity": "22,400",
                    "Primary Use": "Football"
                },
                ar: {
                    "Capacity": "22,400",
                    "Primary Use": "كرة القدم"
                }
            }
        },
        {
            id: 8,
            name: { en: "AM14 Academy", ar: "أكاديمية AM14" },
            type: "sport",
            coordinates: [34.447889301001915, 35.83873706216858],
            description: { 
                en: "Local football training academy for youth and professionals.", 
                ar: "أكاديمية تدريب كرة القدم المحلية للشباب والمحترفين." 
            },
            image: "AM14.png",
            details: {
                en: {
                    "Focus": "Football Training",
                    "Programs": "Youth and Adult"
                },
                ar: {
                    "Focus": "تدريب كرة القدم",
                    "Programs": "الشباب والكبار"
                }
            }
        },
        {
            id: 9,
            name: { en: "Gym Factory", ar: "جيم فاكتوري" },
            type: "sport",
            coordinates: [34.44569384970934, 35.82712836882037],
            description: { 
                en: "Modern gym facility offering group classes and personal training.", 
                ar: "منشأة رياضية حديثة تقدم دروس جماعية وتدريب شخصي." 
            },
            image: "gym.png",
            details: {
                en: {
                    "Facilities": "Weights, Cardio, Classes",
                    "Open Hours": "6:00 AM – 11:00 PM"
                },
                ar: {
                    "Facilities": "أوزان، كارديو، دروس",
                    "Open Hours": "6:00 صباحًا – 11:00 مساءً"
                }
            }
        },
        {
            id: 10,
            name: { en: "Mug Coffee Shop", ar: "مقهى ماغ" },
            type: "coffeeshop",
            coordinates: [34.44404725668373, 35.83082837248385],
            description: { 
                en: "Trendy coffee shop serving specialty drinks and pastries.", 
                ar: "مقهى عصري يقدم مشروبات خاصة والحلويات." 
            },
            image: "MUG.png",
            details: {
                en: {
                    "Menu": "Coffee, Tea, Desserts",
                    "Ambience": "Cozy & Modern"
                },
                ar: {
                    "Menu": "قهوة، شاي، حلويات",
                    "Ambience": "مريح وعصري"
                }
            }
        },
        {
            id: 11,
            name: { en: "Kahwabar", ar: "قهوة بار" },
            type: "coffeeshop",
            coordinates: [34.44248611544223, 35.82935626665121],
            description: { 
                en: "Popular café with a unique Arabic twist on drinks and décor.", 
                ar: "مقهى شعبي بلمسة عربية فريدة على المشروبات والديكور." 
            },
            image: "kahwa.png",
            details: {
                en: {
                    "Menu": "Arabic Coffee, Snacks",
                    "Features": "Indoor & Outdoor Seating"
                },
                ar: {
                    "Menu": "قهوة عربية، وجبات خفيفة",
                    "Features": "مقاعد داخلية وخارجية"
                }
            }
        },
        {
            id: 12,
            name: { en: "11:11 Coffee Shop", ar: "مقهى 11:11" },
            type: "coffeeshop",
            coordinates: [34.4455307509322, 35.826957361654266],
            description: { 
                en: "Aesthetic café known for its peaceful atmosphere and specialty coffee.", 
                ar: "مقهى جمالي معروف بجوّه الهادئ وقهاوته الخاصة." 
            },
            image: "1111.png",
            details: {
                en: {
                    "Highlights": "Specialty Coffee, Chill Vibes",
                    "Opening Hours": "9:00 AM – 12:00 AM"
                },
                ar: {
                    "Highlights": "قهوة خاصة، أجواء هادئة",
                    "Opening Hours": "9:00 صباحًا – 12:00 منتصف الليل"
                }
            }
        },
        {
            id: 13,
            name: { en: "Nazih Nashabe Pharmacy", ar: "صيدلية نزيه النشابة" },
            type: "health",
            coordinates: [34.44482680627371, 35.83149284690297],
            description: { 
                en: "Trusted pharmacy serving the neighborhood with medications and health products.", 
                ar: "صيدلية موثوقة تخدم الحي بالأدوية والمنتجات الصحية." 
            },
            image: "pharmacy.png",
            details: {
                en: {
                    "Services": "Prescription & OTC",
                    "Contact": "06 123456"
                },
                ar: {
                    "Services": "وصفات طبية وبدون وصفة",
                    "Contact": "06 123456"
                }
            }
        },
        {
            id: 14,
            name: { en: "Islamic Charity Hospital", ar: "مستشفى الإحسان الخيري" },
            type: "health",
            coordinates: [34.442472623244164, 35.83236820888749],
            description: { 
                en: "Non-profit hospital offering general medical services to the Tripoli community.", 
                ar: "مستشفى غير ربحي يقدم خدمات طبية عامة لمجتمع طرابلس." 
            },
            image: "islamic.png",
            details: {
                en: {
                    "Departments": "Emergency, Surgery, Pediatrics",
                    "Established": "1970s"
                },
                ar: {
                    "Departments": "الطوارئ، الجراحة، طب الأطفال",
                    "Established": "السبعينيات"
                }
            }
        },
        {
            id: 15,
            name: { en: "Al-Hanan Hospital", ar: "مستشفى الحنان" },
            type: "health",
            coordinates: [34.44363969670392, 35.83412865901516],
            description: { 
                en: "Full-service private hospital with modern equipment and expert doctors.", 
                ar: "مستشفى خاص كامل الخدمات مع معدات حديثة وأطباء خبراء." 
            },
            image: "hanan.png",
            details: {
                en: {
                    "Facilities": "24/7 Emergency, Surgery, ICU",
                    "Contact": "+961 6 654321"
                },
                ar: {
                    "Facilities": "طوارئ 24/7، جراحة، العناية المركزة",
                    "Contact": "+961 6 654321"
                }
            }
        }
    ];

    // Add markers to the map
    const markers = [];
    locations.forEach(location => {
        const marker = L.marker(location.coordinates, {
            icon: createCustomMarker(location.type)
        }).addTo(map);

        let detailsHtml = '';
        for (const [key, value] of Object.entries(location.details[currentLang])) {
            detailsHtml += `<p><strong>${key}:</strong> ${value}</p>`;
        }

        marker.bindPopup(`
            <div class="popup-header">
                <h3>${location.name[currentLang]}</h3>
                <p>${translations[currentLang].categories[location.type]}</p>
            </div>
            <div class="popup-body">
                <img src="${location.image}" alt="${location.name[currentLang]}" class="popup-image" onerror="this.src='https://via.placeholder.com/300x160?text=Place+Image'">
                <p>${location.description[currentLang]}</p>
                <div class="location-details">${detailsHtml}</div>
            </div>
            <div class="popup-footer">${translations[currentLang].popupFooter}</div>
        `);

        marker.on('click', function() {
            this.getElement().classList.add('bounce-marker');
            setTimeout(() => {
                this.getElement().classList.remove('bounce-marker');
            }, 1000);
        });

        markers.push({
            id: location.id,
            marker: marker,
            type: location.type,
            name: location.name,
            description: location.description
        });
    });

    // Sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = toggleBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        } else {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        }
    });

    // Current filter and search state
    let currentFilter = 'all';
    let currentSearch = '';

    // Build location list
    function buildLocationList(filter = 'all', search = '') {
        const locationList = document.getElementById('location-list');
        locationList.innerHTML = '';

        const t = translations[currentLang];
        const filteredLocations = locations.filter(location => {
            const matchesFilter = filter === 'all' || location.type === filter;
            const matchesSearch = search === '' || 
                location.name[currentLang].toLowerCase().includes(search.toLowerCase()) || 
                location.description[currentLang].toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (filteredLocations.length === 0) {
            locationList.innerHTML = `<div class="no-results">${t.noResults}</div>`;
            return;
        }

        // Group by category
        const categories = [...new Set(filteredLocations.map(loc => loc.type))];
        
        categories.forEach(category => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = t.categories[category];
            categoryHeader.style.marginTop = '1rem';
            categoryHeader.style.marginBottom = '0.5rem';
            categoryHeader.style.color = 'var(--dark-color)';
            locationList.appendChild(categoryHeader);

            const categoryLocations = filteredLocations.filter(loc => loc.type === category);
            
            categoryLocations.forEach(location => {
                const item = document.createElement('div');
                item.className = 'location-item';
                item.innerHTML = `
                    <h3>${location.name[currentLang]}</h3>
                    <p>${location.description[currentLang].split('.').shift()}.</p>
                `;

                item.addEventListener('click', () => {
                    const marker = markers.find(m => m.id === location.id).marker;
                    map.flyTo(location.coordinates, 17, {
                        duration: 0.5
                    });
                    marker.openPopup();
                    
                    // Highlight the item temporarily
                    item.classList.add('highlight');
                    setTimeout(() => {
                        item.classList.remove('highlight');
                    }, 2000);
                });

                locationList.appendChild(item);
            });
        });
    }

    // Initial build
    buildLocationList();

    // Filter locations by category
    document.getElementById('category-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        buildLocationList(currentFilter, currentSearch);
    });

    // Search functionality
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentSearch = e.target.value;
        buildLocationList(currentFilter, currentSearch);
    });

    // Debounce search input
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }


});