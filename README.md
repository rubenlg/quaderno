# Point & Click adventure game prototyping toolkit. [![Build Status](https://travis-ci.org/rubenlg/quaderno.svg?branch=master)](https://travis-ci.org/rubenlg/quaderno)

## Demo

If you want to see this in action, [here is a game prototype built with this toolkit](https://rubenlg.github.io/quaderno/examples/quantum_derail/).

## Usage

This toolkit allows creating game prototypes using purely declarative syntax. You can create whole prototypes just by drawing images and writing an HTML file, without any Javascript.

Here is a simple example:

```html
  <game first-room="start">

    <room id="start">
      <img src="intro.png"></img>
      <region coords="386,428,636,521" goto-room="finished" tooltip="Yes, here!"></region>
    </room>

    <room id="finished">
      <img src="finished.png"></img>
    </room>

  </game>
```

This simple example creates an adventure game with two rooms. The player moves from one to the other by clicking on the "Click here" word in the `intro.png` image. Let's go through it step by step:

`<game>` is the tag representing the whole game. You only need to specify one attribute `first-room` to clarify in which room should a player start.

`<room>` is the tag representing one of the rooms. It only requires an identifier (`id`) to be able to refer to the room when navigating. You can include inside any HTML that you want, but typically, you will add a background image and a bunch of regions. In this simple game there are two rooms.

`<region>` is the tag representing active regions of the room. You specify the coordinates with `coords`, which takes the values `left,top,right,bottom`.

In a `region`, you can define what to do when the user clicks on it. In this example, there is an action `goto-room` which tells the game to navigate to another room.

And that's it for the very basics, this is the hello-world example that you can find in the `examples` directory. If you open that example, you will see how to turn this into a working game, with a bunch of stuff in the `<head>` of the HTML file.
You can see the example live [here](https://rubenlg.github.io/quaderno/examples/hello_world/)

### Inventory

The inventory is the set of objects owned by the player so far. It is optional, and is defined inside the `<game>` tag. Here is one example:

```html
  <game first-room="...">

    ...

    <inventory initial-contents="star">
      <img src="star.png" id="star" tooltip="A star" />
      <img src="circle.png" id="circle" tooltip="A circle" />
    </inventory>
  </game>
```

As you can see, it's essentially a list of images. Each image must have an `id` attribute, so that you can refer to them. These describe all the possible things that can ever be in possesion of the player.

When the game starts, it reads the `initial-contents` property in the `<inventory>` tag to decide which images should be available (and therefore, visible) initially.

Inventory items can be used by dragging them over regions on each room. In order to define what to do when the user drags an inventory item over a region, you can use the `<give>` tag. For example:

```html
  <region coords="115,144,339,339" tooltip="Drag here a star!">
    <give id="star" goto-room="room2"></give>
  </region>
```

Here he `<give>` tag is used inside a region to define what to do when you drag the inventory item with id `star` over it. It's transitioning to another room.

You can also manipulate the inventory by using the inventory actions:

*  `inventory-add` adds one ore more items to the inventory.
*  `inventory-del` removes one ore more items from the inventory.

You can see a small example using the inventory [here](https://rubenlg.github.io/quaderno/examples/inventory/).

### Conversations

Another basic feature of adventure games in general, and point&click in particular is conversations.

You can define the whole flow of a conversation inside your HTML file too. You define all the possible sentences exchanged between the player and some character inside a `<conv-group>` node.

Then, you define a set of `<conv>` nodes each representing the character maybe saying something and all the possible replies from the player.

Here is an example:

```html
  <conv-group id="character1">
    <prompt style="left: 250; top: 150"></prompt>
    <conv id="start" prompt="Hi there!">
      <li next-conv="name">Hi, what's your name?</li>
      <li goto-room="start">Nevermind...</li>
    </conv>
    <conv id="name" prompt="My name is Left person, and you?">
      <li goto-room="start">Nevermind...</li>
      <li goto-room="finished">I want to finish this game</li>
    </conv>
  </conv-group>
```

This example defines the conversation identified as `character1`. The first node inside the group is a `<prompt>`. That node defines where in the screen you will see the sentences said by the character. By default, it's displayed as a callout pointing to the coordinate defined in the style attribute.

The first `<conv>` node with id `start` starts by displaying the text *Hi there!* inside the prompt, and shows two possible replies from the player.

When the player clicks one of the replies, the actions defined inside the reply are executed. A new action worth mentioning here is `next-conv`, which moves the conversation forward by activating another `<conv>` node within the same group. A way to close a conversation is by navigating to the same room where you are.

Same as with rooms, there is no implicit order in a conversation. Conversations are invisible by default, and an action has to explicitly activate them. That is done with the `show-conv` action. For example:

```html
  <region coords="133,107,310,410" show-conv="character1.start" tooltip="Left person"></region>
```

The `show-conv` action has to define two elements: the ID of the `<conv-group>` to show, and the ID of the `<conv>` inside that `<conv-group>`, separated by a dot.

If you want a conversation to show right away when entering a room, you can set the attribute `default` on one of its `<conv>` nodes.

There is a small example of conversations [here](https://rubenlg.github.io/quaderno/examples/conversation/).

### Room states

Sometimes one of your rooms has to change state permanently. For example, the lights are turned on, and the player turns them off. Of course you can pretend these are different rooms, but then what happens when you leave the room to some other place and come back?

To solve this problem, rooms can have several states. On each state of course you can use a different background, and also different regions or conversations. Defining different room states is not different from defining different rooms, except for the ID.

Here is one example:

```html
  <room id="start:white">
    <img src="intro.png"></img>
    <region coords="80,431,301,519" goto-room="start:blue" tooltip="Changes the state of this room"></region>
  </room>

  <room id="start:blue">
    <img src="intro-blue.png"></img>
    <region coords="80,431,320,521" goto-room="start:white" tooltip="Changes the state of this room"></region>
  </room>
```

In this example, there is in reality just one room `start`, with two states `white` and `blue`. The part after the colon is the state. You can change between them the same way you change between rooms, but specifying the state too when navigating.

However, the state is remembered when you leave the room. Now, if some other room has a `goto-room="start"` (notice that it doesn't specify the state), it will navigate to the current state of the `start` room. The state is remembered as long as links point to the room name without the state.

Sometimes it's necessary to change some room state remotely, i.e. without navigating to it. Think for example of a character using a lever in one room that opens a door in another room. That can be done with the action `remote-room-state`. You use it similarly to `goto-room`, except that the player stays in the current room.

There is an example of room states [here](https://rubenlg.github.io/quaderno/examples/room_states/).

### Saying things

Sometimes you just want to pretend that the player is saying something, for example, when clicking on a region to inspect it. That can be simulated with a conversation, but there is direct support for that too. You can use the `say` action. For example:

```html
  <region coords="0, 0, 300, 448" say="This is a window"></region>
```

Note that there is no support for running actions in sequence. If you want to wait until the player dismisses a thing being said before executing another action, then you are better off using a conversation without prompt and a `<conv default>`. The Quantum Derail [prototype](https://rubenlg.github.io/quaderno/examples/quantum_derail) in the examples directory does that in a few places.

### Debug mode

The toolkit has a basic debug mode. You can enable it by adding the following script to your `<head>` tag:

```html
  <script>
    window.DEBUG = true;
  </script>
```

In debug mode you get a console below the game window, with information about what's going on.

You also get editable boxes for each region. You can move them and resize them, and the console will display the new coordinates for you to copy&paste them in your game code.

### Integrating with Google Analytics

In case you want to check what rooms are visited most, or where your players get stuck or spend the most time, there is Google Analytics integration.

The toolkit will automatically report page views for each room when you navigate if you [include the Google Analytics code](https://developers.google.com/analytics/devguides/collection/analyticsjs/) in your HTML file.

Remember to inform your users about cookies and stuff if you do that.

### Skinning

If you are making a prototype, perhaps this is the least important thing to consider. However, since you define the game with HTML tags, you can use CSS to change how they look and feel. The toolkit provides default CSS that just works. Feel free to override it with your own rules.

## Using the examples

First you need to build the javascript library, with the following commands:

```sh
npm install
npm run build
```

The first command will install all the required dependencies, and the second one builds the javascript library.

And now you can open the `index.html` file of any of the examples directly in your browser.

## Feature requests / PRs

This toolkit is aimed at making prototypes, not real games. As such, it is meant to be really simple to use and not have too many features, so that it is easy to learn and use.

If you are stuck making your prototype and think that adding an extra feature would help you and many others, feel free to open an issue here on github, but keep in mind that it could be rejected if it is too specific to your game.

Here are some examples of features that I don't want to add (please don't request these), because it complicates usage too much:

*  **Animations**: If you are adding animations, you are already much later in the production of your game. If all the feedback you get from testers of your prototype is that it lacks animations, then you are ready to move to the next stage and use a real engine.
*  **Multi-dimensional state**: Room states have just one dimension. If you want to have more, you can do the combinatory explosion yourself. For example, if your room has a light switch and a door, you can create four states: `switch_on-door_open`, `switch_on-door_closed`, `switch_off-door_open`, `switch_off-door_closed`. However, think carefully if you really need that much detail when prototyping.

If you are planning to send a PR for a feature that you think is cool, I strongly recommend creating an issue first to discuss it, so that you don't end up doing work that gets rejected.

And finally, this is github, you can just fork the repository if you want to add features that I don't want in the core toolkit.

## License

MIT
