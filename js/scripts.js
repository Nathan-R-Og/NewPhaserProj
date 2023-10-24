/*window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 72,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});*/

function intwrap(num, limit) {
    while (num > limit) {
        num -= limit;
    }
    while (num < limit) {
        num += limit;
    }
    return num;
}

function hideOnClick(hider){
    clicked = document.getElementById(hider)
    main = clicked.parentElement.parentElement
    thems = main.parentElement.children
    for(var i = 0; i < thems.length; i++){
        var element = thems[i];
        var hidden = element.getAttribute("hidden");
        if(element == main){
            continue
        }
        if (hidden) {
            element.removeAttribute("hidden");
        } else {
            element.setAttribute("hidden", "hidden");
        }
    }
}

function randomPick(arr){
    console.log(arr)
    var va = Math.floor(Math.random() * arr.length)
    console.log(va)
    return arr[va]
}
function refGen(){
    
    
            //make a link between all the elements of Refs and all the superscripts
            scan = document.getElementsByTagName("sup")
            qd = false
            nd = false
            actual = 1
            for(i = 0; i < scan.length; i++){
                e = scan[i]
                AUGH = scan[i].innerHTML
                console.log(AUGH)
                if(qd != true){
                 if(AUGH == "[?]"){
                     Refs.splice(actual - 1, 0, "???. Unreliable source.");
                     qd = true;
                     actual++
                 }
                }
                if(nd != true){
                 if(AUGH == "[N]"){
                     Refs.splice(actual - 1, 0, "N. Straight from the source.");
                     nd = true;
                     actual++
                 }
                }
                if(e.children.length >= 1){
                    fucker = e.children[0]
                    fucker.setAttribute("href", "#cite-note-" + String(actual))
                    fucker.innerHTML = "[" + String(actual) + "]"
                    actual++
                }
            }
            //make a list that shows if any are duplicated or not
            ns = []
            for(i = 0; i < Refs.length; i++){
                e = Refs[i]
                found = false
                use = i
                
                for(j = 0; j < ns.length; j++){
                    f = ns[j][0]
                    if(e==f){found = true; use = j; break;}
                }
                if(found){
                    ns.push([e, use, i])
                }
                else{
                    use = ns.length
                    ns.push([e, use, i])
                }
            }
            //refactor the superscripts
            for(i = 0; i < scan.length; i++){
                if(scan[i].children.length >= 1){
                    fucker = scan[i].children[0]
                    content = fucker.getAttribute("href").replace("#cite-note-", "")
                    num = -1
                    for(j = 0; j < ns.length; j++){
                        if(content == ns[j][2] + 1){
                            num = ns[j][1] + 1
                            break
                        }
                    }
                    fucker.setAttribute("href", "#cite-note-" + String(num))
                    fucker.innerHTML = "[" + String(num) + "]"
                }
            }
            //cleanup the references
            let final = []
            for(i = 0; i < Refs.length; i++){
                e = Refs[i]
                found = false
                for(j = 0; j < final.length; j++){
                    f = final[j]
                    if(e==f){found = true;break;}
                }
                if(found){continue}
                else{
                    final.push(e)
                }
            }
            //generate the actual reference list. finally.
            Refs = final
            list = document.getElementById("genList")
            for(i = 0; i < Refs.length; i++){
                item = document.createElement("li")
                item.innerHTML = Refs[i]
                item.setAttribute("id", "cite-note-" + String(i + 1))
                list.appendChild(item)
            }
}

function gitGet(){
    base = "https://github.com/Nathan-R-Og/nathapedia/edit/main/"
    base2 = "https://github.com/Nathan-R-Og/nathapedia/commits/main/"
    plus = window.location.pathname
    document.getElementById("source").setAttribute("href", base + plus)
    document.getElementById("history").setAttribute("href", base2 + plus)
}