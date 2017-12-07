import logging
import time
import os
import re
import random
import json
import requests
from threading import Thread, Event
from respeaker import Microphone
from respeaker.bing_speech_api import BingSpeechAPI
from gtts import gTTS

# use madplay to play mp3 file
os.system('madplay')

END_POINT = 'http://192.168.1.2:3000'

# get a key from https://www.microsoft.com/cognitive-services/en-us/speech-api
BING_KEY = 'f6f0bfec08274b8790520a9079b808af'

responses = (
    ("hello",                ("Hi!", "Hello!", "Greetings!", "Howdy!")),
    ("hi",                   ("Hi!", "Hello!", "Greetings!", "Howdy!")),
    ("how are you",          ("I'm fine, thank you.",)),
    ("i need (.*)",          ("Why do you need {}?", "Would it really help you to get {}?", "Are you sure you need {}?")),
    ("why don't you (.*)",   ("Do you really think I don't {}?", "Perhaps eventually I will {}.", "Do you really want me to {}?")),
    ("why can't I (.*)",     ("Do you think you should be able to {}?", "If you could {}, what would you do?", "I don't know -- why can't you {}?", "Have you really tried?")),
    ("i can't (.*)",         ("How do you know you can't {}?", "Perhaps you could {}if you tried.", "What would it take for you to {}?")),
    ("i am (.*)",            ("Did you come to me because you are {}?", "How long have you been {}?", "How do you feel about being {}?")),
    ("are you (.*)",         ("Why does it matter whether I am {}?", "Would you prefer it if I were not {}?", "Perhaps you believe I am {}.", "I may be {}-- what do you think?")),
    ("how (.*)",             ("How do you suppose?", "Perhaps you can answer your own question.", "Why can't you answer your question?", "What is it you're really asking?")),
    ("i think (.*)",         ("Do you doubt {}?", "Do you really think so?", "But you're not sure {}?")),
    ("(.*) friend (.*)",     ("Tell me more about your friends.", "What do you value in a friend?")),
    ("yes",                  ("Okay, but can you tell me more?", "Can you actually be sure?", "You seem quite certain.")),
    ("no",                   ("Why not?", "Can you tell me why you say no?", "Are you sure?")),
    ("is it (.*)",           ("Do you think it is {}?", "Perhaps it's {}-- what do you think?", "If it were {}, what would you do?", "It could well be that {}.")),
    ("can you (.*)",         ("If I could {}, then what?", "Why do you ask if I can {}?")),
    ("can i (.*)",           ("Do you want to be able to {}?", "If you could {}, would you?")),
    ("you are (.*)",         ("Why do you think I am {}?", "Perhaps you would like me to be {}.", "Are you really talking about yourself?")),
    ("you're (.*)",          ("Why do you say I am {}?", "Why do you think I am {}?", "Are we talking about you, or me?")),
    ("i don't (.*)",         ("Why don't you {}?", "DO you want to {}?")),
    ("i feel (.*)",          ("Tell me more about these feelings.", "Do you often feel {}?", "When do you usually feel {}?", "When you feel {}, what do you do?")),
    ("i have (.*)",          ("Why do you tell me that you've {}?", "Have you really {}?", "Now that you have {}, what will you do next?")),
    ("i would (.*)",         ("Could you explain why you would {}?", "Why would you {}?", "Who else knows that you would {}?")),
    ("is there (.*)",        ("Do you think there is {}?", "Is it likely that there is {}?", "Would you like there to be {}?")),
    ("my name is (.*)",      ("Hi, {}",)),
    ("my (.*)",              ("Why do you say that your {}?", "When your {}, how do you feel?")),
    ("you (.*)",             ("We should be discussing you, not me.", "Why do you say that about me?", "Why do you care whether I {}?")),
    ("i want (.*)",          ("What would it mean to you if you got {}?", "Why do you want {}?", "What would you do if you got {}?", "If you got {}, then what you do?")),
    ("i don't know (.*)",    ("Perhaps you should learn.", "I don't know either.")),
    ("i'm (.*)",             ("Why are you {}?",)),
    ("because (.*)",         ("if {}, what else is true?", "Is that a good reason?", "Are there any other good reasons?", "Is that the only reason?", "Why do you think {}?")),
    ("i (.*)",               ("Why do you {}?",)),
    ("(.*) is (.*)",         ("Why is {} {}?",)),
    ("(.*) can't (.*)",      ("Why can't {}, {}")),
    ("why (.*)",             ("What do you think?", "Why do you think {}?", "Why don't you know the answer yourself?")),
    ("(.*) are (.*)",        ("Why are {} {}?",)),
    ("(.*)",                 ("Can you please elaborate?", "I don't fully understand.", "Let's stop talking about this.", "How are you feeling about this?")),
)

pronouns = {
    "i'm": "you're", 
    "i": "you", 
    "me": "you",
    "yours": "mine",
    "you": "I",
    "am": "are",
    "my": "your",
    "you're": "I'm",
    "was": "were"
}

vocabulary = []
ans = []
score = []
vocNo = 0
ansNum = 0
isStart = False
isChat = False


def chat(raw):
    global isChat
    random.seed()
    input = re.split("[\.!?]",raw.lower().rstrip('.!?'))
    full_reply = ' '
    
    for sentence in input:
        sentence=sentence.lstrip()
        for pattern in responses:
            wildcards = []
            if re.match(pattern[0], sentence):
                wildcards = filter(bool, re.split(pattern[0], sentence))
                # replace pronouns
                wildcards = [' '.join(pronouns.get(word, word) for word in wildcard.split()) for wildcard in wildcards]

                response = random.choice(pattern[1])
                response = response.format(*wildcards)
                full_reply+=response+' '
                
                break
    
    return full_reply

def vocTest(input):
    global vocNo
    global ansNum
    global isStart
    input = input.lstrip()
    ansNum += 1

    print("ans:" + ans[vocNo])
    print("in:" + input)

    if ans[vocNo] in input:
        ansNum = 0
        vocNo += 1
        if vocNo == len(vocabulary):
            isStart = False
            vocNo = 0
            testResult = ','.join(map(str, score))
            requests.post(END_POINT + '/1/perlessonScore', data={'testResult': testResult})
            return "Congratulations, you have completed all the questions."
        return "Good! How to spell " + vocabulary[vocNo]
    elif ansNum > 3:
        ansNum = 0
        score[vocNo] = 0
        vocNo += 1        
        if vocNo == len(vocabulary):
            isStart = False
            vocNo = 0
            testResult = ','.join(map(str, score))
            requests.post(END_POINT + '/1/perlessonScore', data={'testResult': testResult})
            return "It is spelled " + ans[vocNo - 1] + ". Congratulations, you have completed all the questions."
        return "It is spelled " + ans[vocNo - 1] + ". It doesn't matter, the next question is how to spell " + vocabulary[vocNo]
    elif ansNum == 3:
        score[vocNo] -= 1
        prefix = vocabulary[vocNo][0].upper()
        suffix = vocabulary[vocNo][len(vocabulary[vocNo])-1].upper()
        return "Please think again. The prefix of this word is " + prefix + " and the suffix is " + suffix
    elif ansNum == 2:
        score[vocNo] -= 1
        return "It is not correct. The vocabulary consists of " + str(len(vocabulary[vocNo])) + " letters"
    else:
        score[vocNo] -= 1
        return "Wrong, please try again."

def task(quit_event):
    global ansNum
    global isStart
    global isChat
    global ans
    global vocabulary
    global score
    mic = Microphone(quit_event=quit_event)
    bing = BingSpeechAPI(key=BING_KEY)
    while not quit_event.is_set():
        if mic.wakeup('teresa'):
            print('Wake up')
            os.system('rm temp.mp3')
            data = mic.listen()
            try:
                text = bing.recognize(data)
                if text:
                    print('\n> %s' % text)
                    
                    if (isStart == False) and ('test start' in text):
                        response = requests.get(END_POINT + '/1/vocabulary')
                        qaObj = response.json()
                        vocabulary = qaObj["question"]
                        ans = qaObj["answer"]
                        score = [4] * len(vocabulary)
                        
                        isStart = True
                        vocNo = 0
                        tts = gTTS(text="How to spell " + vocabulary[vocNo], lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')
                    elif (isStart == False) and ('play music' in text):
                        tts = gTTS(text='I will play music!', lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')
                        os.system('madplay ~/Tchaikovsky_Concerto_No.1p.mp3')
                    elif (isStart == False) and (isChat == False) and ('chat' in text):
                        isChat = True
                        tts = gTTS(text='OK! Let’s Chat !', lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')
                    elif (isStart == False) and (isChat == True) and ('Stop Chat' in text):
                        isChat = False
                        tts = gTTS(text='So, let’s talk again soon!', lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')
                    elif (isStart == False) and (isChat == True):
                        output = chat(text)
                        print('\n>> %s' % output)
                        tts = gTTS(text=output, lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')
                    elif isStart == False:
                        tts = gTTS(text="Please say test start to start the test.", lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')                        
                    else:
                        output = vocTest(text)
                        print('\n>> %s' % output)
                        tts = gTTS(text=output, lang='en-us')
                        tts.save("temp.mp3")
                        os.system('madplay temp.mp3')
 
            except Exception as e:
                print(e.message)

def main():
    logging.basicConfig(level=logging.DEBUG)
    quit_event = Event()
    thread = Thread(target=task, args=(quit_event,))
    thread.start()
    while True:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            print('Quit')
            quit_event.set()
            break
    thread.join()

if __name__ == '__main__':
    main()
