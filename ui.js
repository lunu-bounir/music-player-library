'use strict';

var ui = {
  callbacks: []
};
ui.emit = (name, val) => (ui.callbacks[name] || []).forEach(c => c(val));
ui.on = (name, callback) => {
  ui.callbacks[name] = ui.callbacks[name] || [];
  ui.callbacks[name].push(callback);
};

ui.timer = {
id: null,
  timeout: () => ui.emit('report')
};
ui.timer.start = function() {
  window.clearInterval(this.id);
  this.id = window.setInterval(this.timeout, 1000);
};
ui.timer.stop = function() {
  window.clearInterval(this.id);
};

ui.volume = {
  root: document.getElementById('volume'),
  set level(val) {
    this.root.querySelector('[data-id=progress]').style.width = `${val * 100}%`;
  },
  set buffer(val) {
    this.root.querySelector('[data-id=buffer]').style.width = `${val * 100}%`;
  },
  set mute(val) {
    val = Boolean(val);
    document.getElementById('mute').dataset.active = val;
    this.root.dataset.hidden = val;
  }
};
ui.progress = {
  root: document.getElementById('progress'),
  set level(val) {
    this.root.querySelector('[data-id=progress]').style.width = `${val * 100}%`;
  },
  set buffer(val) {
    this.root.querySelector('[data-id=buffer]').style.width = `${val * 100}%`;
  }
};

ui.time = {
  root: document.getElementById('time'),
  set total(val) {
    this.root.querySelector('[data-id=total]').textContent = val;
  },
  set current(val) {
    this.root.querySelector('[data-id=current]').textContent = val;
  }
};

ui.song = {
  root: document.getElementById('song'),
  set title(val) {
    this.root.querySelector('[data-id=title]').textContent = val;
  },
  set cover(val) {
    this.root.querySelector('img').src = val;
  }
};

ui.song.artist = {};
ui.song.artist.populate = arr => {
  const artist = ui.song.root.querySelector('[data-id=artist]');
  artist.textContent = '';
  arr.map(({artist, href}) => Object.assign(document.createElement('a'), {
    textContent: artist,
    href
  })).forEach(a => artist.appendChild(a));
};
ui.playlist = {};
ui.playlist.populate = arr => {
  const playlist = document.querySelector('#playlist ul');
  const template = document.querySelector('[data-id=playlist-entry]');
  // get the old list and update
  const lis = playlist.querySelectorAll('li');
  arr.forEach(({title, cover, artist}, index) => {
    let li = lis[index];
    if (li) {
      if (li.dataset.title === title) {
        return;
      }
      li.querySelector('[data-id=artist]').textContent = '';
    }
    else {
      const clone = document.importNode(template.content, true);
      li = clone.querySelector('li');
      playlist.appendChild(clone);
    }
    li.dataset.index = index;
    li.dataset.title = title;
    li.querySelector('h1').textContent = title;
    li.querySelector('img').src = cover;
    artist.map(({artist, href}) => Object.assign(document.createElement('a'), {
      textContent: artist,
      href
    })).forEach(a => li.querySelector('[data-id=artist]').appendChild(a));
  });
};

Object.defineProperty(ui, 'like', {
  set(val) {
    document.getElementById('dislike').dataset.mode = 'disabled';
    document.getElementById('like').dataset.mode = 'disabled';
    switch(val) {
      case 'liked':
        document.getElementById('like').dataset.mode = 'liked';
        break;
      case 'disliked':
        document.getElementById('dislike').dataset.mode = 'disliked';
    }
  }
});

Object.defineProperty(ui, 'repeat', {
  set(val) {
    document.getElementById('repeat').dataset.mode = val === 'off' ? 'disabled' : val;
  }
});

Object.defineProperty(ui, 'mode', {
  set(val) {
    val = val === 'play' ? 'pause' : 'play';
    const e = (document.getElementById('play') || document.getElementById('pause'));
    e.id = val;
    ui.timer[val === 'pause' ? 'start' : 'stop']();
  }
});

document.addEventListener('click', e => {
  const {target} = e;
  const cmd = target.dataset.cmd;

  if (cmd === 'progress') {
    const {left, width} = e.target.getBoundingClientRect();
    ui.emit('command', {
      target: target.id,
      level: (e.clientX - left) / width
    });
  }
  else if (cmd === 'select-song') {
    ui.emit('command', {
      target: cmd,
      index: Number(target.dataset.index)
    });
  }
  else if (cmd) {
    ui.emit('command', cmd);
  }
});


// ui.volume.level = 20;
// ui.volume.buffer = 90;
// ui.volume.mute = true;
// ui.progress.level = 50;
// ui.progress.buffer = 80;
// ui.time.total = '23:22';
// ui.song.title = 'This is a sample song title';
// ui.song.artist.populate([{
//   artist: 'artist-name',
//   href: 'http://sdasd/asdsad/comad/'
// }, {
//   artist: 'artist-name',
//   href: 'http://sdasd/asdsad/comad/'
// }]);
// ui.playlist.populate([{
//   title: 'this is a title',
//   artist: [{
//     artist: 'this is an artist',
//     href: 'dddd'
//   }, {
//     artist: 'this is the second artsit',
//     href: 'this is dsasd'
//   }]
// }, {
//   title: 'this is a title',
//   artist: [{
//     artist: 'this is an artist',
//     href: 'dddd'
//   }, {
//     artist: 'this is the second artsit',
//     href: 'this is dsasd'
//   }]
// }]);
// ui.like = 'disliked'; // liked, disliked, none
// ui.repeat = 'one'; // off, one, all
// ui.mode = 'pause';
