import {Person} from './index.js';

const person1=new Person("Alice",30);
document.querySelectorAll('body')[0].innerHTML+=`<p>${person1.name}  is ${person1.age} years old.</p>`;



console.log(person1.add(1,2))