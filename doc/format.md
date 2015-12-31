
Note Format
===========

These are the allowed tags and their nestings:

    Note
    |
    +-> Text:	All characters but < and >
    |
    +-> Br:		<br/>
    |
    +-> Link:   <a href="#-K6rJ4JnnTpGIV4AncFu">Link</a>
    |   |
    |   +-> Text
    |
    +-> Title:	<h1>This is a title</h1>
    |   |
    |   +-> Text
    |
    +-> Bold:	<strong>Bold text</strong>
    |   |
    |   +-> Text
    |   +-> Link
    |   +-> Br
    |   +-> Italic (With no Bold inside)
    |
    +-> Italic:	<em>Italic text</em>
    |   |
    |   +-> Text
    |   +-> Link
    |   +-> Br
    |   +-> Bold (With no Italic inside)
    |
    +-> List:	<ul><li>Item1</li> ... </ul>
    |   |
    |   +-> Text
    |   +-> Link
    |   +-> Italic (With no Br)
    |   +-> Bold (With no Br)
