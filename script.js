let cur = 0

let isSubmitting = false

const TOTAL = 12

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9xYINil1i4_Z0-gOlimKPUZjLwM0jbgXtZOjVTxAYQngwpDjGKoqZvN080ABdVjkRPw/exec'

function pick(el,id,type,max){

hideError()

if(type === 'r'){

document.querySelectorAll('#'+id+' .opt').forEach(o => {
o.classList.remove('on')
})

el.classList.add('on')

if(document.getElementById(id).dataset.auto === 'true'){

setTimeout(() => {
go(1)
},260)

}

}

if(type === 'm'){

el.classList.toggle('on')

if(max){

const active = document.querySelectorAll('#'+id+' .opt.on')

if(active.length > max){
el.classList.remove('on')
showError('Du kan högst välja ' + max + ' alternativ.')
}

}

}

}

function getValues(id){

return [...document.querySelectorAll('#'+id+' .opt.on label')].map(el => el.innerText.trim())

}

function rangeChange(input,valueId){

hideError()

input.dataset.touched = 'true'

const value = Number(input.value)
const min = Number(input.min)
const max = Number(input.max)
const pct = ((value - min) / (max - min)) * 100

input.style.background = 'linear-gradient(to right, #1554ff 0%, #1554ff ' + pct + '%, rgba(21,84,255,.14) ' + pct + '%, rgba(21,84,255,.14) 100%)'

document.getElementById(valueId).innerText = value

}

function hasAnswer(stepIndex){

if(stepIndex === 11){
return true
}

if(stepIndex === 5){
return document.getElementById('q5').dataset.touched === 'true'
}

if(stepIndex === 9){
return document.getElementById('q9').dataset.touched === 'true'
}

const group = document.getElementById('q' + stepIndex)

if(!group){
return true
}

return group.querySelectorAll('.opt.on').length > 0

}

function showError(text){

const error = document.getElementById('errorMsg')

error.innerText = text || 'Välj ett svar för att gå vidare.'

error.classList.add('show')

}

function hideError(){

document.getElementById('errorMsg').classList.remove('show')

}

function updateUI(){

document.querySelectorAll('.step').forEach(step => step.classList.remove('on'))

document.getElementById('s' + cur).classList.add('on')

const progress = ((cur + 1) / TOTAL) * 100

document.getElementById('prog').style.width = progress + '%'

document.getElementById('stepCount').innerText = 'Fråga ' + (cur + 1) + ' av ' + TOTAL

if(cur === 0){
document.getElementById('topbar').classList.remove('show')
}else{
document.getElementById('topbar').classList.add('show')
}

window.scrollTo({
top:0,
behavior:'smooth'
})

}

function go(d){

hideError()

if(d > 0 && !hasAnswer(cur)){
showError()
return
}

cur += d

if(cur < 0){
cur = 0
}

if(cur > TOTAL - 1){
cur = TOTAL - 1
}

updateUI()

}

async function submitSurvey(){

if(isSubmitting){
return
}

isSubmitting = true

hideError()

const submitBtn = document.getElementById('submitBtn')

if(submitBtn){
submitBtn.classList.add('disabled')
submitBtn.innerText = 'Skickar...'
}

const data = {
timestamp: new Date().toISOString(),
org: getValues('q0')[0] || '',
industry: getValues('q1')[0] || '',
vehicle_type: getValues('q2')[0] || '',
fleet_size: getValues('q3')[0] || '',
purchase_factors: getValues('q4').join('|'),
satisfaction: document.getElementById('q5').dataset.touched === 'true' ? document.getElementById('q5').value : '',
main_challenge: getValues('q6')[0] || '',
premium: getValues('q7').join('|'),
features: getValues('q8').join('|'),
design_importance: document.getElementById('q9').dataset.touched === 'true' ? document.getElementById('q9').value : '',
willingness_to_pay: getValues('q10')[0] || '',
comments: document.getElementById('comments').value || ''
}

document.querySelectorAll('.step').forEach(step => step.classList.remove('on'))
document.getElementById('loading').classList.add('on')
document.getElementById('prog').style.width = '100%'
document.getElementById('stepCount').innerText = 'Skickar'
document.getElementById('topbar').classList.add('show')

try{

await fetch(GOOGLE_SCRIPT_URL,{
method:'POST',
mode:'no-cors',
headers:{
'Content-Type':'text/plain;charset=utf-8'
},
body:JSON.stringify(data)
})

}catch(error){

console.log(error)

}

document.querySelectorAll('.step').forEach(step => step.classList.remove('on'))
document.getElementById('loading').classList.remove('on')
document.getElementById('done').classList.add('on')
document.getElementById('stepCount').innerText = 'Klar'

}