let fs = require("fs");
let cheerio = require("cheerio");
let path = require("path");
let request = require("request");

if (!fs.existsSync(path.join(__dirname, "IPL 2020")))
  fs.mkdirSync(path.join(__dirname, "IPL 2020"));
let URL = `https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results`;

request(URL, cb);

function cb(err, res, html) {
  if (err) {
    console.log(err);
  }
  let chSelector = cheerio.load(html);
  let teamNames = chSelector(".match-info.match-info-FIXTURES .name");

  let set = new Set();

  for (let i = 0; i < teamNames.length; i++)
    set.add(chSelector(teamNames[i]).text());
  //console.log(set);
  //for (let i = 0; i < link.length; i++) console.log(link[i]);
  for (let i of set) {
    if (!fs.existsSync(path.join(path.join(__dirname, "IPL 2020"), i)))
      fs.mkdirSync(path.join(path.join(__dirname, "IPL 2020"), i));
  }
  let links = chSelector(".btn.btn-sm.btn-outline-dark.match-cta");
  let link = [];
  for (let i = 0; i < links.length; i++) {
    let l = chSelector(links[i]).attr("data-hover");
    if (l == "Scorecard") {
      let t = chSelector(links[i]).attr("href");
      link.push(`https://www.espncricinfo.com` + t);
    }
  }
  for (let i = 0; i < link.length; i++) {
    request(link[i], cb1);
  }
}
function cb1(err, res, html) {
  if (err) console.log(err);

  let chSelector = cheerio.load(html);
  //   let tables = chSelector(".batsman-cell.text-truncate.out a");
  //   for (let i = 0; i < tables.length; i++) {
  //     console.log(chSelector(tables[i]).text());
  //   }

  let part = chSelector(".Collapsible");
  for (let i = 0; i < part.length; i++) {
    //console.log(chSelector(part[i]).html(), "\n\n\n");
    //let chSelector1 = cheerio.load(part[i]);
    let names = chSelector(".Collapsible .col h5");
    //console.log(names.length);
    let acronym;
    let t = chSelector(names[i]).text().split("INNINGS")[0];
    let matches = t.match(/\b(\w)/g);
    acronym = matches.join("");
    if (acronym == "PK") acronym = "PBKS";
    if (acronym == "SH") acronym = "SRH";

    let data = chSelector(part[i]);
    // console.log(acronym);
    writeStats(chSelector, data, acronym);
  }
}
function writeStats(chSelector, data, acronym) {
  //console.log(acronym);
  let allRows = chSelector(data).find(".table.batsman tbody tr");
  for (let i = 0; i < allRows.length - 1; i += 2) {
    //console.log(chSelector(allRows[i]).text());
    let eachbatcol = chSelector(allRows[i]).find("td");
    // console.log(
    //   chSelector(eachbatcol[0]).text(),
    //   chSelector(eachbatcol[2]).text(),
    //   "=R ",
    //   chSelector(eachbatcol[3]).text(),
    //   "=B ",
    //   chSelector(eachbatcol[5]).text(),
    //   "=4s ",
    //   chSelector(eachbatcol[6]).text(),
    //   "=6s ",
    //   chSelector(eachbatcol[7]).text(),
    //   "=SR "
    // );
    let fileExist = fs.existsSync(
      `./IPL 2020/${acronym}/${chSelector(eachbatcol[0]).text()}.json`
    );
    if (!fileExist) {
      fs.writeFileSync(
        `./IPL 2020/${acronym}/${chSelector(eachbatcol[0]).text()}.json`,
        JSON.stringify([])
      );
    }
    let content = fs.readFileSync(
      `./IPL 2020/${acronym}/${chSelector(eachbatcol[0]).text()}.json`,
      "utf-8"
    );
    console.log(content);
    arr = JSON.parse(content);

    arr.push({
      runs: chSelector(eachbatcol[2]).text(),
      balls: chSelector(eachbatcol[3]).text(),
      fours: chSelector(eachbatcol[5]).text(),
      sixes: chSelector(eachbatcol[6]).text(),
      SR: chSelector(eachbatcol[7]).text(),
    });
    content = JSON.stringify(arr);
    fs.writeFileSync(
      `./IPL 2020/${acronym}/${chSelector(eachbatcol[0]).text()}.json`,
      content
    );
  }
}
