const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const playlist = $('.playlist')
const heading  = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const PLAYER_STORAGE_KEY = 'player'
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReapeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {} ,
    song: [
        {
            name: "Mất kết nối",
            singer: "Dương Domic",
            path: "./assests/music/matketnoi.mp3",
            img: "./assests/img/matketnoi.jpg"
        },
        {
            name: "Dù cho tận thế",
            singer: "Erik",
            path: "./assests/music/duchotanthe.mp3",
            img: "./assests/img/duchotanthe.jpg"
        },
        {
            name: "Ánh mắt biết cười",
            singer: "Quang Hùng MasterD & Tăng Duy Tân",
            path: "./assests/music/anhmatbietcuoi.mp3",
            img: "./assests/img/anhmatbietcuoi.jpg"
        },
        {
            name: "Wrong Times",
            singer: "Puppy, Dangrangto",
            path: "./assests/music/WrongTimes.mp3",
            img: "./assests/img/WrongTimes.jpg"
        },
        {
            name: "Giờ Thì",
            singer: "buitruonglinh",
            path: "./assests/music/giothi.mp3",
            img: "./assests/img/giothi.jpg"
        }
    ],
    setConfig:  function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const html = this.song.map((song, index) => {
            return `<div class="song ${ index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.img}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = html.join('\n');
    },
    defineProperty: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.song[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this;
        const cd = $('.cd')
        const cdWidth = cd.offsetWidth

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg'}
        ], {
            duration: 10000,
            iterations: Infinity
        })

        cdThumbAnimate.pause()

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        repeatBtn.onclick = function() {
            _this.isReapeat = !_this.isReapeat
            _this.setConfig('isReapeat', _this.isReapeat)
            repeatBtn.classList.toggle('active', _this.isReapeat)
        }

        audio.onended = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
                audio.play()
            }
            else if (_this.isReapeat) {
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
            }
        }
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.song.length) {
            this.currentIndex = 0
        }

        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.song.length - 1
        }

        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex = this.currentIndex
        do {
            newIndex = Math.floor(Math.random() * this.song.length)
        } while (newIndex == this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },

    start: function() {
        this.loadConfig()

        this.defineProperty()

        this.handleEvents()

        this.loadCurrentSong()

        this.render()

        repeatBtn.classList.toggle('active', this.isReapeat)
        randomBtn.classList.toggle('active', this.isRandom)
    }
}

app.start()