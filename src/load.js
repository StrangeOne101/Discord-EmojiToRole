import _ from "lodash"

/**
 * Fixes possible errors in emoji strings by matching them to a pattern.
 * @param {String} emojiDiscriminator The string from the config file.
 * @returns {*} A proper emojiDiscriminator or null.
 */
function cleanEmojiDiscriminator(emojiDiscriminator) {
	var regEx = /[A-Za-z0-9_]+:[0-9]+/
	var cleaned = regEx.exec(emojiDiscriminator)
	if (cleaned) return cleaned[0]
	return emojiDiscriminator
}

/**
 * Fetches all messages that need to be tracked into the cache. Makes sure each message is having the proper reactions attached.
 * @param {*} client The bot client.
 * @param {*} config The config file.
 */
export default function(client, config) {
	client
		.on("ready", async function () {
			console.log("Fetching messages")
			let debug_count_messagesFetched = 0
			for (let { channel, message_ids, reactions } of config) {
                for (let message_id of message_ids) {
                var message = await client.channels.cache.get(channel).messages.fetch(message_id)
                		.catch(error => console.error(error))
                    if (!message) continue
                    ++debug_count_messagesFetched
                    for (var {emoji} of reactions) {
                        emoji = cleanEmojiDiscriminator(emoji)
                        var messageReaction = message.reactions.cache.get(emoji)
                        if (messageReaction) {
                            //Fetch each reaction into cache to keep track of them
                            messageReaction.users.fetch({ limit: 50 })
                            /*await message.react(emoji)
                                .catch(console.error())*/

                        }


                    }
                }

                for (var {emoji, channel: chan} of reactions) {
                    if (chan !== 'undefined' && client.channels.cache.get(chan) === 'undefined') {
                        console.error("Failed to find channel with ID " + chan + " for emoji [" + emoji + "]! This channel cannot be reported to!")
                    }
                }

			}
			console.log(`Done fetching ${debug_count_messagesFetched} message(s).`)
		})
}
