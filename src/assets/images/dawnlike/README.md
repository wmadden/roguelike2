To pack a directory using TexturePacker:

```
# Where $name holds the name of the directory (and will be the output name)
TexturePacker --format json --sheet $name.png --data $name.json $name; done
```

To pack all directories in the current directory:

```
for dirname in `ls -d */`; do name=$(basename $dirname); TexturePacker --format json --sheet $name.png --data $name.json $name; done
```
