import json

def printOptions(node):
    for i in node['options']:
        print(i['id'] + '. ' + i['text'])

def getOptionsCount(node):
    count = 0
    for i in node['options']:
        count += 1
    return count

def getAnswerforOptions(count):
    answer = input('\nMake a choice: ')
    # answer must be an integer in range of options
    while True:
        try:
            answer = int(answer)
            if (answer > 0 and answer <=count):
                return answer
        except ValueError:
            notInt = True
        prompt = '\nMake a choice between 1 and ' + str(count) + ': '
        answer = input(prompt)
    

def main(name):
    nodeFile = open('nodes.json')
    nodes = json.load(nodeFile)
    # All nodes
    nodes = nodes['nodes']

    # game logic
    nodeIndex = 0
    FINALNODES = [9]

    while True:
        currentNode = nodes[nodeIndex]

        print(currentNode['text'],"\n")

        if nodeIndex in FINALNODES:
            break

        printOptions(currentNode)

        answer = getAnswerforOptions(getOptionsCount(currentNode))

        # show feedback
        print("\n",currentNode['options'][answer-1]['feedback'],"\n")
        # set the currentNode the target node of the user's answer
        nodeIndex = int(currentNode['options'][answer-1]['target'])

        
    print("GAME OVER")


if __name__ == '__main__':
    main('PyCharm')

