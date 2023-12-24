
const _F = require ('sprintf-js').sprintf

const logger = (..._) => {
	if (_.length > 1) return console.log (_F (..._))

	return console.log (..._)
}

class pqDiscord {
	constructor () {
		this.pn = 'discord'

		this._F       = _F
		this._fs      = require ('fs')
		this._discord = require ('discord.js')
		this._totime  = require ('to-time')


		this._starttime = 0

		this._infong = 0
		this._infonc = 0
		this._infonr = 0
		this._infodl = 0

		this._infoevents = {}

		return this
	}

	log (..._) {return logger (this._F ('%s > `%s`', this.pn, this._F (..._)))}

	notify () {}
	devlog () {}

	start () {
		return new Promise ((resolve, reject) => {
			this.dc = new this._discord.Client (
				{
					partials: ['MESSAGE', 'REACTION']
				}
			)
			this.__r__ = resolve

			const client = this.dc

			client.on ('error', err => {
				if (err.error.code == 'ETIMEDOUT') return reject ('timeout')

				if (err.error.code == 'ENOTFOUND') return reject ('timeout')
				
				return reject (err.error.code)
			})
			const ranks = {
				Fishing: '🐟',
				Fox    : '🦊',
				Abyssal: '🌊',

				Castle : '🏰',

				Snowmen: '⛄',

				Attack : '🦒',

				'Bait'    : '🐟',
				'bait'    : '🐟',
				'fox hunt': '🦊',
				'fox Hunt': '🦊',
				'Fox hunt': '🦊',
				'Fox Hunt': '🦊',

				'Snowvasion': '⛄',
				'snowvasion': '⛄',

				'giant'          : '🦒',
				'Giant'          : '🦒',
				'attack on giant': '🦒',
				'Attack on giant': '🦒',
				'attack on Giant': '🦒',
				'Attack on Giant': '🦒',
			}

			const realranks = {
				'🐟': 'Fishing',
				'🦊': 'Fox',
				'🌊': 'Abyssal',

				'🏰': 'Castle',

				'⛄': 'Snowmen',

				'🦒': 'Attack',

			}
			const guildranks = {}
			const prettyevent = {
				Fishing: 'Bait',
				Fox    : 'Fox Hunt',
				Abyssal: 'Abyssal',

				Castle : 'Castle',

				Snowmen: 'Snowmen',

				Attack : 'Attack on Giant',
			}

			const allowednames = {
				pqmwevent: true,
				pqevent  : true,
				pqe      : true,
			}

			const cachedguilds = {}

			const sclookup = {
				'': 'chatchannel',
				'': 'chatchannel',

				'': 'syschannel',
			}

			const sccache = {
				echannel   : [],
				devchannel : [],
				syschannel : [],
				chatchannel: [],
			}

			const ecolor = {
				Fishing: 0x5684E8, // 🐟
				Fox    : 0xE8A43F, // 🦊
				Abyssal: 0x302EBF, // 🌊

				Castle : 0xFAFA55, // 🏰

				Snowmen: 0xD7E4F7, // ⛄

				Giant  : 0x45E6B5, // 🦒
			}

			client.on ('ready', () => {
				this._starttime = Date.now ()

				this.log ('ready with: %s - %s', client.user.username, client.user.id)

				client.channels.cache.forEach (_channel => {
					if (allowednames [_channel.name]) {
						this._infonc += 1

						this.log ('using channel from guild: %s %s - %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name)
						sccache.echannel.push (_channel)

						if (!cachedguilds [_channel.guild.id]) {
							this._infong += 1

							guildranks [_channel.guild.id] = {
								role : {},
								emoji: {},
							}

							_channel.guild.roles.cache.forEach (_role => {
								const emoji = ranks [_role.name]

								if (emoji) {
									this._infonr += 1

									this.log ('using rank from guild: %s %s', _role.id, _role.name)

									guildranks [_channel.guild.id].role  [realranks [emoji]] = this._F ('<@&%s>', _role.id)
									guildranks [_channel.guild.id].emoji [emoji            ] = _role
								}
							})
							cachedguilds [_channel.guild.id] = true
						} else {
							this.log ('guild cached already: %s %s', _channel.guild.id, _channel.guild.name)
						}
					} else if (sclookup [_channel.id]) {
						this._infodl += 1

						this.log ('devlog found: %s %s - %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name)
						sccache [sclookup [_channel.id]].push (_channel)
					}
				})

				const send = (event, str) => {
					sccache.echannel.forEach (_channel => {
						_channel.send (this._F ('%s %s', guildranks [_channel.guild.id].role [event] || '', str))
							.then  ((    ) => {this.log ('sent msg to: %s %s %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name)})
							.catch ((..._) => {this.log ('fail msg to: %s %s %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name); console.log (..._)})
					})
				}
				const sendnp = (event, str) => {
					sccache.echannel.forEach (_channel => {
						_channel.send (str)
							.then  ((    ) => {this.log ('sent msg to: %s %s %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name)})
							.catch ((..._) => {this.log ('fail msg to: %s %s %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name); console.log (..._)})
					})
				}
				const sendembed = emb => {
					sccache.echannel.forEach (_channel => {
						_channel.send (emb)
							.then  ((    ) => {this.log ('sent msg to: %s %s %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name)})
							.catch ((..._) => {this.log ('fail msg to: %s %s %s %s', _channel.id, _channel.name, _channel.guild.id, _channel.guild.name); console.log (..._)})
					})
				}

				const lbfields = (e, n, v) => {return {name: n, value: this._F ('%s %s', v, e == 'Fishing' ? '🐟' : '🦊'), inline: true}}

				this.notify = (event, time, ..._) => {
					this.log ('event: %s %s', event, time)

					const msg = new this._discord.MessageEmbed ()

					msg.setColor (ecolor [event] || 0xF551B6)

					time = parseInt (time)

					switch (time) {
						case -1:
							send (event, this._F ('%s started!', prettyevent [event] || event))
							break
						case -2:
							this._infoevents [event] = this._infoevents [event] || 0
							this._infoevents [event] += 1

							if (event == 'Castle') {
								if   (_ [2]) {send (event, this._F ('%s (%s) Took Castle From %s (%s)', _ [0], _ [1], _ [2], _ [3]))}
								else         {send (event, this._F ('%s (%s) Held The Castle'         , _ [0], _ [1]              ))}
								break
							}
							const s = event == 'Snowmen' ? send : sendnp
							s (event, this._F ('%s ended!', prettyevent [event] || event))
							break
						case -3:
							sendnp (event, this._F ('%s leaderboard!', prettyevent [event] || event))

							msg.addFields (
								lbfields (event, _ [0] [0] [0], _ [0] [0] [1]),
								lbfields (event, _ [0] [1] [0], _ [0] [1] [1]),
								lbfields (event, _ [0] [2] [0], _ [0] [2] [1])
							)

							sendembed (msg)
							break
						case -4:
							if (event == 'Abyssal') {
								this._infoevents [event] = this._infoevents [event] || 0
								this._infoevents [event] += 1
							}

							sendnp (event, this._F ('%s leaderboard!', prettyevent [event] || event))

							msg.addField  ('Winner', this._F ('%s won!', _ [0]))

							sendembed (msg)
							break
						case -5:
							switch (typeof _ [0]) {
								case 'object': sendnp (event, this._F ('Fox-chan spawned at (x%s y%s z%s)', _ [0] [0], _ [0] [1], _ [0] [2])); break
								default      : sendnp (event, this._F ('Fox-chan killed by %s'            , _ [0]                          )); break
							}
							break
						default:
							send (event, this._F ('%s starts in %d %s!', prettyevent [event] || event, time, _ [0]))
					}
				}

				this.channellogger = (c, str) => {
					sccache [c].forEach (_c => {
						_c.send (str)
							.then  (() => {})
							.catch ((..._) => {console.log (..._)})
					})
				}

				this.devlog  = str => this.channellogger ('chatchannel', str)
				this.syslog  = str => this.channellogger ('syschannel' , str)
				this.chatlog = str => this.channellogger ('chatchannel', str)

			})

			client.on ('message', msg => {
				try {
					if (client.user.id == msg.author.id) return
					if (msg.content    == ''           ) return

					// this.log ('%s` in `%s` with `%s', this._F ('%s#%s', msg.author.username, msg.author.discriminator), msg.guild ? msg.guild.name : 'dm', msg.content.substr (0, 64))

					if (msg.author.id != ) return

					if (!msg.guild && msg.content == 'info') {
						let s = ''

						s += this._F ('```\n%s\n', this._totime.fromMilliseconds (Date.now () - this._starttime).humanize ())
						s += this._F ('g%d c%d r%d d%d\n', this._infong, this._infonc, this._infonr, this._infodl)

						for (const e in this._infoevents) {
							s += this._F ('%s %s ', ranks [e] || '⏹️', this._infoevents [e])
						}

						s += '```'

						msg.channel.send (s)
					}
				} catch (e) {
					console.log (e)
				}
			})

			client.on ('messageReactionAdd', async (r, u) => {
				if (r.message.partial) {
					try {
						await r.message.fetch ()
					} catch (e) {}
				}

				if (r.message.author.id != '') return

				const user = await r.message.channel.guild.members.fetch (u.id)

				if (!user) return

				const giverole = guildranks [r.message.channel.guild.id].emoji [r.emoji.name]

				if (!giverole) return

				user.roles.add (giverole)
					.then  (() => {this.log ('gave user role: %s#%s %s - %s %s - %s %s', user.user.username, user.user.discriminator, user.id, giverole.name, giverole.id, r.message.channel.guild.name, r.message.channel.guild.id)})
					.catch (() => {})
			})
			client.on ('messageReactionRemove', async (r, u) => {
				if (r.message.partial) {
					try {
						await r.message.fetch ()
					} catch (e) {}
				}

				if (r.message.author.id != '') return

				const user = await r.message.channel.guild.members.fetch (u.id)

				if (!user) return
				if (r.message.author.id != '') return

				const giverole = guildranks [r.message.channel.guild.id].emoji [r.emoji.name]

				if (!giverole) return

				user.roles.remove (giverole)
					.then  (() => {this.log ('remove user role: %s#%s %s - %s %s - %s %s', user.user.username, user.user.discriminator, user.id, giverole.name, giverole.id, r.message.channel.guild.name, r.message.channel.guild.id)})
					.catch (e  => {console.log (e)})
			})

			this._fs.readFile ('./data/discord.token', 'utf8', (err, data) => {
				if (err) return reject ('no token')

				this.log ('starting with: %s',  '*')

				client.login (data)
					.catch (() => {reject ('no login')})
			})
		})
		.then (reason => {
			this.log ('finished good with: %s', reason)

			this.dc.destroy ()

			if (reason == 'reload') return this.start ()
			if (reason == 'stop'  ) return
		})
		.catch (reason => {
			this.log ('finished bad with: %s', reason)

			this.dc.destroy ()

			if (reason == 'no login') return this.start ()
			if (reason == 'timeout' ) return this.start ()
		})
	}
}

class pqMineFlayer {
	constructor () {
		this.pn = 'mineflayer'

		this._F          = _F
		this._fs         = require ('fs/promises')
		this._mineflayer = require ('mineflayer')

		this._totime  = require ('to-time')

		this.ip   = ''
		this.port = 

		this.niceip = this._F ('%s:%d', this.ip, this.port)

		this.__et = {
			['Error: read ECONNRESET'                            ]: () => this.start (),
			[this._F ('Error: connect ETIMEDOUT %s', this.niceip)]: () => this.start (),
			['FetchError: request to https://authserver.mojang.com/authenticate failed, reason: getaddrinfo ENOTFOUND authserver.mojang.com']: () => this.start (),
		}

		this.__l = {}

		return this
	}

	log (..._) {return logger (this._F ('%s > `%s`', this.pn, this._F (..._)))}

	notify (..._) {}
	devlog (..._) {}

	recursiveaddmsgchunk (msg) {
		let txt = msg.text

		if (!msg?.extra) return txt

		for (const _ in msg.extra) txt += this.recursiveaddmsgchunk (msg.extra [_])

		return txt
	}

	msghandler (msg) {
		const ex = msg.extra
		const m  = msg.text

		if (msg.translate) return

		if (msg.color == 'light_purple') {
			this.devlog (0, '```\nPM %s: %s\n```', ex [0]?.text, ex [2]?.text)

			return
		}
		if (ex?.[0]?.text == 'accept') {
			const n = m.match (/^Teleport (\w+)\? $/)

			return this.syslog (0, '```\nTP %s\n```', n [1])
		}

		if (m?.match (/was rekt by/)) {
			let k = m.match (/^(\w+) was rekt by (\w+) using $/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], msg?.extra?.[0]?.text || '>?')

			k = m.match (/^(\w+) was rekt by (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			k = m.match (/^(\w+) was rekt by (\w+)'s (.+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], k [3])

			k = m.match (/^(\w+) was rekt by $/)
			if (k?.[1]) {
				let v = msg?.extra?.[0]?.text.match (/^(\w+)'s (.+)$/)
				if (v?.[1])	return this.syslog (0, '```\nKILL %s > %s with %s\n```', v [1], k [1], v [2])

				// v = msg?.extra?.[0]?.text.match (/^(\w+)'s ([\w ]+) using $/)
				// if (v?.[1])	return this.syslog (0, '```\nKILL %s > %s with %s with %s\n```', v [1], k [1], v [2], msg?.extra?.[1]?.text || '>?')
			}
			k = m.match (/^(\w+) was rekt by$/)
			if (k?.[1]) {
				let v = msg?.extra?.[0]?.text.match (/^(\w+)'s ([\w ]+) using $/)

				if (v?.[1])	return this.syslog (0, '```\nKILL %s > %s with %s with %s\n```', v [1], k [1], v [2], msg?.extra?.[1]?.text || '>?')
			}

			throw '!'
		}
		if (m?.match (/was shot by/)) {
			let k = m.match (/^(\w+) was shot by (\w+) using $/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], msg?.extra?.[0]?.text || '>?')

			k = m.match (/^(\w+) was shot by (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			k = m.match (/^(\w+) was shot by (\w+)'s (.+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], v [1], k [2])

			throw '!'
		}
		if (m?.match (/was blown up by/)) {
			let k = m.match (/^(\w+) was blown up by (\w+) using $/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], msg?.extra?.[0]?.text || '>?')

			k = m.match (/^(\w+) was blown up by (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			k = m.match (/^(\w+) was blown up by (\w+)'s (.+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], k [3])

			throw '!'
		}
		if (m?.match (/was burnt to a crisp whilst fighting/)) {
			let k = m.match (/^(\w+) was burnt to a crisp whilst fighting (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			throw '!'
		}
		if (m?.match (/hit the ground too hard whilst trying to escape/)) {
			let k = m.match (/^(\w+) hit the ground too hard whilst trying to escape (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			throw '!'
		}
		if (m?.match (/away whilst fighting/)) {
			let k = m.match (/^(\w+) away whilst fighting (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			throw '!'
		}
		if (m?.match (/rekt \w+ and got a \w+ \w+!$/)) {
			let k = m.match (/^(\w+) rekt (\w+) and got a (\w+) \w+!$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s x%s\n```', k [1], k [2], msg?.extra?.[0]?.text || '>?')

			throw '!'
		}
		if (m?.match (/fell from a high place$/)) {
			const k = m.match (/^(\w+) fell from a high place$/)

			return this.syslog (0, '```\nKILL %s > world > height\n```', k [1])
		}
		if (m?.match (/self-disintegrated$/)) {
			const k = m.match (/^(\w+) self-disintegrated$/)

			return this.syslog (0, '```\nKILL %s > self > self-disintegrated\n```', k [1])
		}
		if (m?.match (/was anally raped by/)) {
			let k = m.match (/^(\w+) was anally raped by (\w+) using $/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], msg?.extra?.[0]?.text || '>?')

			k = m.match (/^(\w+) was anally raped by (\w+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s\n```', k [1], k [2])

			k = m.match (/^(\w+) was anally raped by (\w+)'s (.+)$/)
			if (k?.[1]) return this.syslog (0, '```\nKILL %s > %s with %s\n```', k [1], k [2], k [3])

			k = m.match (/^(\w+) was anally raped by $/)
			if (k?.[1]) {
				let v = msg?.extra?.[0]?.text.match (/^(\w+)'s (.+)$/)
				if (v?.[1])	return this.syslog (0, '```\nKILL %s > %s with %s\n```', v [1], k [1], v [2])
			}
			k = m.match (/^(\w+) was anally raped by$/)
			if (k?.[1]) {
				let v = msg?.extra?.[0]?.text.match (/^(\w+)'s ([\w ]+) using $/)
				if (v?.[1])	return this.syslog (0, '```\nKILL %s > %s with %s with %s\n```', v [1], k [1], v [2], msg?.extra?.[1]?.text || '>?')
			}

			throw '!'
		}
		if (m?.match (/withered away whilst fighting/)) {
			const k = m.match (/^(\w+) withered away whilst fighting (\w+)$/)

			return this.syslog (0, '```\nKILL %s > %s > withered\n```', k [1], k [2])
		}
		if (m?.match (/was killed trying to hurt/)) {
			const k = m.match (/^(\w+) was killed trying to hurt (\w+)$/)

			return this.syslog (0, '```\nKILL %s > %s > hurt\n```', k [1], k [2])
		}
		if (m?.match (/went off with a bang due to a firework fired from $/)) {
			const k = m.match (/^(\w+) went off with a bang due to a firework fired from $/)

			return this.syslog (0, '```\nKILL %s > self with firework > %s\n```', k [1], msg?.extra?.[0]?.text || '>?')

		}
		if (m?.match (/borrowed soul of/)) {
			const k = m.match (/^(\w+) borrowed soul of (\w+)$/)

			return this.syslog (0, '```\nKILL %s > %s\n```', k [2], k [1])
		}

		const usr = msg?.extra?.[0]?.extra
		if ((usr?.[1]?.text == ': ') || (usr?.[2]?.text == ': ')) return [true, this._F ('%s\n', this.recursiveaddmsgchunk (msg))]

		if (!m) return

		let q

		if (m == 'Snowmen invade the spawn!') return this.notify ('Snowmen', -1)
		if (m == 'Snowmen melt away!'       ) return this.notify ('Snowmen', -2)

		if (m == 'Reconnecting...') return
		if (m == 'Sending to server throne...') return

		q = m.match (/^(\w+) invited you to join (.+?)\. Type $/                                               ); /*       */ if (q) return this.syslog (0, '```INVITE %s > %s```', q [1], q [2])
		q = m.match (/^§6\[CLAN-NEWS\] §a(\w+) created (.+?) \((\w+)\)!$/                                      ); /* §6 §a */ if (q) return this.syslog (0, '```CLAN %s (%s) MADE BY %s```', q [2], q [3], q [1])
		q = m.match (/^§e\w+ for \w+ begins in (\d+) (\w+)\.§7\sLearn more: minewind\.com\/battle$/            ); /* §e §7 */ if (q) return this.notify ('Castle', q [1], q [2])
		q = m.match (/^§e\w+ for \w+ has begun!$/                                                              ); /* §e    */ if (q) return this.notify ('Castle', -1)
		q = m.match (/^§a(.+?) \((\w+)\) hold the ([\w ]+)!$/                                                  ); /* §a    */ if (q) return this.notify ('Castle', -2, q [1], q [2])
		q = m.match (/^§a(.+?) \((\w+)\) take the ([\w ]+) from (.+?) \((\w+)\)!\\n$/                          ); /* §a    */ if (q) return this.notify ('Castle', -2, q [1], q [2], q [4], q [5])
		q = m.match (/^§e(\w+) of ([\w ]+) \((\w+)\) brought (((\w+) LV(\d))\/?((\w+) LV(\d))?) to ([\w ]+)\.$/); /* §e    */ if (q) return this.syslog (0, '```CLAN %s (%s) CHANGED (%s %s) (%s %s)```', q [2], q [3], q [6], q [7], q [9] || '', q [10] || '')
		q = m.match (/^§e(\w+) sharpened (.+?) to \+(\d+)!$/                                                   ); /* §e    */ if (q) return this.syslog (0, '```SHARPEN %s %s %s```', q [1], q [2], q [3])
		q = m.match (/^(\w+) got (\d+) fish from (\w+) as they ([\w ]+)$/                                      ); /*       */ if (q) return
		q = m.match (/^Queued as #(\d+) to rejoin (\w+) on startup\.$/                                         ); /*       */ if (q) return
		q = m.match (/^Queue=(\d+)$/                                                                           ); /*       */ if (q) return
		q = m.match (/^§dFox-chan spawned at ([-\d]+) ([-\d]+) ([-\d]+)!$/                                     ); /* §d    */ if (q) return this.notify ('Fox', -5, [q [1], q [2], q [3]])
		q = m.match (/^§e(\w+) has slain Fox-chan!$/                                                           ); /* §e    */ if (q) return this.notify ('Fox', -5, q [1])
		// q = m.match (/^§e(\w+) \w+ begins in (\d+) (\w+)\.$/                                                   ); /* §e    */ if (q) return this.notify (q [1], q [2], q [3])
		q = m.match (/^§e(\w+) \w+? ?\w+ begins in (\d+) (\w+)\.$/                                             ); /* §e    */ if (q) return this.notify (q [1], q [2], q [3])
		q = m.match (/^§e(\w+) \w+? ?\w+ has begun!$/                                                          ); /* §e    */ if (q) return this.notify (q [1], -1)
		q = m.match (/^§e(\w+)( Hunt)?( on Giant)? ?(event)? ends!$/                                           ); /* §e    */ if (q) return this.notify (q [1], -2)
		q = m.match (/^§a(\w+) wins the abyssal event! Poseidon is pleased!$/                                  ); /* §a    */ if (q) return this.notify ('Abyssal', -4, q [1])
		q = m.match (/^§e(\d)\) §r(\w+) -- (\d+) (\w+)$/                                                       ); /* §e §r */ if (q) return this.lfunc (q)

		return 0x007FFF
	}

	setup (resolve, reject, misc) {
		const mf = this.mf
		let   cl = '```\n'

		mf.on ('message', msg => {
			const __pq__ = Date.now ()

			try {
				const rt = this.msghandler (msg)

				if ((typeof rt == 'object') && rt?.[0] && (typeof rt?.[1] == 'string')) {

					cl += rt [1]

					if (cl.length >= 600) {
						cl += '\n```'
									
						cl = cl.replace (/discord\.gg/g , '∑')
							   .replace (/discord\.com/g, '∑')
		
						this.chatlog (1, cl)
									
						cl = '```\n'
					}
				}

				if (rt != 0x007FFF) return

				const okay = Date.now () - __pq__

				console.log (msg)
				console.log (this._F ('\ntime taken to error %s (%s)\n', this._totime.fromMilliseconds (okay).humanize (true), okay))
			} catch (e) {
				const okay = Date.now () - __pq__

				console.log (msg)
				console.log (e)
				console.log (this._F ('\ntime taken to error %s (%s)\n', this._totime.fromMilliseconds (okay).humanize (true), okay))
			}
		})

		mf.on ('login', () => {this.log ('logged into: %s %s:%s' , mf.username, misc.i, misc.r)})
		mf.on ('spawn', () => {this.log ('spawned into: %s %s:%s', mf.username, misc.i, misc.r)})

		mf.on ('error', a => {
			console.log (a, '!')
			if (a == 'Error: write ECONNRESET') return resolve ('reload')

			return reject (a)
		})
		mf.on ('end', a => {
			console.log (a, '?')
			if (!a) return resolve ('reload')

			console.log (a)

			return resolve ('reload')
		})
	}

	escape (s) {return s.replace (/[\*_`~@]/g, '\\$&')}
	__ed (..._)  {return this.start ()}

	lfunc  (q) {
		this.__l [q [1] - 1] = [this.escape (q [2]), q [3]]

		if (q [1] == 3) {
			this.notify (q [4] == 'fish' ? 'Fishing' : 'Fox', -3, this.__l)

			this.__l = {}
		}
	}

	start () {
		return new Promise (async (resolve, reject) => {
			const u = await this._fs.readFile ('./data/minecraft.user'    , 'utf8'),
			      p = await this._fs.readFile ('./data/minecraft.password', 'utf8'),
			      i = await this._fs.readFile ('./data/minecraft.ip'      , 'utf8')

			if (!u || !p || !i) return reject (this._F ('??? %s %s %s ???', u, p, i))

			const r = 

			this.mf = this._mineflayer.createBot ({
				host    : i  ,
				port    : r,
				username: u ,
				password: p
			})

			this.log ('starting on: %s:%s', i, r)

			this.setup (resolve, reject, {u, p, i, r})
		})
		.then (reason => {
			this.log ('finished good with: %s', reason)

			if (this.mf) {
				try {
					this.mf.quit ()
				} catch (_) {}
			}

			if (reason == 'reload') return this.start ()
			if (reason == 'stop'  ) return

			this.restart (15)
		})
		.catch (reason => {
			this.log ('finished bad with: %s', reason)

			if (this.mf) {
				try {
					this.mf.quit ()
				} catch (_) {}
			}

			const e = this.__et [reason]

			if (e) {
				try {
					return e ()
				} catch (_) {
					return this.__ed ()
				}
			}

			if (reason == 'no user'      ) return
			if (reason == 'no password'  ) return

			this.restart (15)
		})
	}

	restart (s) {
		if (this.__r__) return

		this.__r__ = true

		setTimeout (
			() => {
				this.__r__ = false

				this.start ()
			},
		s * 1000)
	}
}

const start = () => {
	const d = new pqDiscord    ()
	const m = new pqMineFlayer ()

	d.start () // t
	m.start () // u, p, i, p


	// d.link (


	m.notify = (..._) => {return d.notify (..._)}


	m.channellogger = (c, f, s, ..._) => {
		switch (typeof f) {
			case 'number':
				switch (f) {
					case 0: return c (_F (s, ..._))
					case 1: return c (s, ..._)
					default: return c (s, ..._)
				}
			case 'boolean':
				switch (f) {
					case true : return c (_F (s, ..._))
					case false: return c (s, ..._)
				}
			case 'string': return c (f, s, ..._)
			default: return c (s, ..._)
		}
	}

	m.devlog  = (f, s, ..._) => m.channellogger (d.devlog , f, s, ..._)
	m.syslog  = (f, s, ..._) => m.channellogger (d.syslog , f, s, ..._)
	m.chatlog = (f, s, ..._) => m.channellogger (d.chatlog, f, s, ..._)
}

start ()
