/*jslint browser:true */

(function () {
    "use strict";
    
    Function.prototype.method = function (name, func) {
        if (!this.prototype[name]) {
            this.prototype[name] = func;
            return this;
        }
    };
    
    Element.method('addClass', function (name) {
        this.classList.add(name);
    });
    
    Element.method('removeClass', function (name) {
        this.classList.remove(name);
    });
    
    Element.method('hasClass', function (name) {
        return this.classList.contains(name);
    });
    
    var tracklist = function (spec) {
        var el = document.getElementById(spec.id),
            audioPlayer = document.getElementById(spec.playerId),
            tracks = [],
            onplaying = false,
            head = null,
            doubleclickHandler = function (trackId) {
                return function () {
                    var player = document.getElementById(spec.playerId),
                        currentMusic,
                        nextMusic,
                        prevMusic;
                    
                    tracks.forEach(function (t) {
                        if (t.element.hasClass("nowplaying")) {
                            t.element.removeClass("nowplaying");
                        }
                        
                        if (t.id === trackId) {
                            currentMusic = t.path;
                            nextMusic = t.next;
                            prevMusic = t.prev;
                            t.element.addClass("nowplaying");
                        }
                    });
                    //audioPlayer.addEventListener("ended", playNext(audioPlayer.src), false);
                    player.setAttribute("src", currentMusic);
                    player.setAttribute("ptrNext", "track-" + nextMusic);
                    player.setAttribute("ptrPrev", "track-" + prevMusic);
                    onplaying = true;
                    player.play();
                };
            },
            
            that = {};
        
        that.addTrack = function (file) {
            var len = tracks.length,
                newTrack = {
                    id: len + 1,
                    element: document.createElement("li"),
                    name: file.name,
                    path: file.path
                },
                lastTrack,
                i;
            // check if files already added.
            for (i = 0; i < len; i += 1) {
                if (tracks[i].path === file.path) {
                    return;
                }
            }
            // add pointerNext and prev to node
            if (head == null) {
                newTrack.next = null;
                newTrack.prev = null;
                head = newTrack.id;
            } else {
                lastTrack = tracks[len - 1];
                newTrack.next = lastTrack.next;
                newTrack.prev = lastTrack.id;
                lastTrack.next = newTrack.id;
            }
            
            newTrack.element.textContent = newTrack.name;
            newTrack.element.setAttribute("id", "track-" + newTrack.id);
            newTrack.element.setAttribute("ptrNext", "track-" + newTrack.next);
            newTrack.element.setAttribute("ptrPrev", "track-" + newTrack.prev);
            newTrack.element.addEventListener("dblclick", doubleclickHandler(newTrack.id), false);
            // untuk pergantian pointer ketika track baru ditambahkan saat playlist sedang berjalan
            if (onplaying) {
                el.lastChild.setAttribute("ptrNext", "track-" + newTrack.id);
            }
            el.appendChild(newTrack.element);
            
            tracks.push(newTrack);
        };
        that.nextPlaying = function (trackId) {
            var arrId = trackId.split("-"),
                player = document.getElementById(spec.playerId),
                currentMusic,
                nextMusic,
                target = parseInt(arrId[arrId.length-1]),
                prevMusic;
            tracks.forEach(function (el) {
                if (el.element.hasClass("nowplaying")) {
                    el.element.removeClass("nowplaying");
                }

                if (el.id === target) {
                    currentMusic = el.path;
                    nextMusic = el.next;
                    prevMusic = el.prev;
                    el.element.addClass("nowplaying");
                }
                player.setAttribute("src", currentMusic);
                player.setAttribute("ptrNext", "track-" + nextMusic);
                player.setAttribute("ptrPrev", "track-" + prevMusic);
                onplaying = true;
                player.play();
            });   
        };
        that.prevTracks = function (trackId) {
            var arrId = trackId.split("-"),
                currentMusic,
                target = parseInt(arrId[arrId.length-1]),
                nextMusic,
                prevMusic;
            tracks.forEach(function (el) {
                if (el.element.hasClass("nowplaying")) {
                    el.element.removeClass("nowplaying");
                }
                
                if (el.id === target) {
                    currentMusic = el.path;
                    nextMusic = el.next;
                    prevMusic = el.prev;
                    el.element.addClass("nowplaying");
                }
                audioPlayer.setAttribute("src", currentMusic);
                audioPlayer.setAttribute("ptrNext", "track-" + nextMusic);
                audioPlayer.setAttribute("ptrPrev", "track-" + prevMusic);
                onplaying = true;
                audioPlayer.play();
            });
                
        };
        return that;
    },
        playlist = function (spec) {
            var el = document.getElementById(spec.id),
                player = document.getElementById(spec.playerId),
                previous = document.getElementById(spec.prevTrack),
                next = document.getElementById(spec.nextTrack),
                repeat = document.getElementById(spec.repeatTrack),
                replay = document.getElementById(spec.replayTrack),
                stop = document.getElementById(spec.stopTrack),
                hasStop = false,
                tracks = tracklist({id: spec.trackId, playerId: spec.playerId}),
                removeDefaultText = function () {
                    var length = el.childNodes.length,
                        children = el.childNodes,
                        removedChild = [],
                        i;
                    
                    for (i = 0; i < length; i += 1) {
                        if (children[i].nodeName === "#text" &&
                                children[i].textContent.trim() === "Drop your music here.") {
                            removedChild.push(children[i]);
                        }
                    }
                    
                    removedChild.forEach(function (child) {
                        el.removeChild(child);
                    });
                },
                replayTrack = function (evt) {
                    evt.stopPropagation();
                    if (player.hasAttribute("src")) {
                        player.currentTime = 0;
                        player.play();
                    }
                },
                repeatTrack = function (evt) {
                    if (player.hasAttribute("src")) {
                        if(!evt.target.hasClass("repeated")) {
                            evt.target.addClass("repeated");
                            player.loop = true;
                        } else {
                            evt.target.removeClass("repeated");
                            player.loop = false;
                        }  
                    }
                },
                stopTrack = function (evt) {
                    evt.stopPropagation();
                    if (player.hasAttribute("src")) {
                        player.currentTime = player.duration;
                        hasStop = true;
                    }
                },
                playNext = function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    if (!hasStop) {
                        tracks.nextPlaying(evt.target.getAttribute("ptrNext"));
                    }
                },
                onplay = function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    if (hasStop) {
                        hasStop = false;
                    }
                },
                prevTrack = function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    var trackId = player.getAttribute("ptrPrev");
                    tracks.prevTracks(trackId);
                },
                nextTrack = function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    var trackId = player.getAttribute("ptrNext");
                    tracks.nextPlaying(trackId);
                },
                dropHandler = function (evt) {
                    
                    var files = evt.dataTransfer.files,
                        length = evt.dataTransfer.files.length,
                        i;
                    
                    evt.stopPropagation();
                    evt.preventDefault();
                    
                    removeDefaultText();
                    el.addClass(spec.filledClass);
                    
                    for (i = 0; i < length; i += 1) {
                        tracks.addTrack(files[i]);
                    }
                    
                    el.removeClass(spec.overClass);
                },
                dragOverHandler = function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    if(evt.target.id == "playlist") {
                        evt.dataTransfer.dropEffect = "copy";
                    }
                    
                },
                dragEnterHandler = function () {
                    el.addClass(spec.overClass);
                },
                dragLeaveHandler = function () {
                    el.removeClass(spec.overClass);
                },
                that = {};
            
            // that only have initation method for now, but we'll 
            // add more functionality later. 
            // E.g.: tracking current music.
            that.init = function () {
                el.addEventListener("dragover", dragOverHandler, false);
                el.addEventListener("dragenter", dragEnterHandler, false);
                el.addEventListener("dragleave", dragLeaveHandler, false);
                el.addEventListener("drop", dropHandler, false);
                player.addEventListener("ended", playNext, false);
                player.addEventListener("playing", onplay, false);
                previous.addEventListener("click", prevTrack, false);
                next.addEventListener("click", nextTrack, false);
                replay.addEventListener("click", replayTrack, false);
                stop.addEventListener("click", stopTrack, false);
                repeat.addEventListener("click", repeatTrack, false);
            };
            
            return that;
        };
    
    document.addEventListener("DOMContentLoaded", function () {
        var pl = playlist({
            id          : "playlist",
            trackId     : "tracks",
            playerId    : "player",
            prevTrack   : "prevTrack",
            nextTrack   : "nextTrack",
            repeatTrack : "repeatTrack",
            replayTrack : "replayTrack",
            stopTrack   : "stopTrack",
            filledClass : "filled",
            overClass   : "over"
        });
        
        pl.init();
        
    }, false);
}());