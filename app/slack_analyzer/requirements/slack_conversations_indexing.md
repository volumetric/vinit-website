For the conversations shown in the channels tab, apart from the current display, add a simple mode, and add it as a toggle at the top of the conversation pane. turning it on should show each conversation thread in simple mardown format or plain text. Remove any extra `@` symbol in front of the names and put a colon after the user's name and before their message. e.g.

Vinit Agrawal: Hello, how are you


I see that the user_id is not replaced with the user's name in some messages, I am not sure why. it is being replaced in other message corresctly. can you fix that.


The reply messages in a conversation thread, after the first message of the thread, are showing in a different container in the UI. don't do that just put everything in the same container and keep the text one after another, just concatenate it with a newline in between, even remove the timestamp for each message. The final output for each conversation should be just one container with simple markdown text.


In the simple conversation view, the markdown is still being rendered to make it look beautiful. But when I copy the conversation text and paste it in my text editor it is looking perfect simple markdown text. Can you make it in such a way that it shows the exact markdown text that I copy, withou any markdown rendering.