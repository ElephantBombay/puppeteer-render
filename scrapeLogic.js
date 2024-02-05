const puppeteer = require("puppeteer");

const scrapeLogic = async (target, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    // headless: false, // To make sure the browser opens, set to False
    defaultViewport: false, // for the browser size to be full screen
    // slowMo: 5,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    // throw new Error("Wow, why not wworking"); //Testing the error handling
    const page = await browser.newPage();

    // Navigate the page to a URL
    // let url = "https://bot.sannysoft.com/";
    // let url = "https://www.trustpilot.com/review/hubspot.com";
    // let url = "https://www.trustpilot.com/review/rentmarketplace.com";
    // let url = "https://www.trustpilot.com/review/www.rentaplacenow.com";
    // let url = "https://www.trustpilot.com/review/www.miel-paris.com";
    // let url = "https://www.trustpilot.com/review/wwwasdfsdf.com";
    let url = `https://www.trustpilot.com/review/${target}`;
    console.log(url);

    await page.goto(url, {
      waitUntil: "load",
    });

    let isBtnDisabled = false;
    let reviews = [];

    while (!isBtnDisabled) {
      console.log(`page ${reviews.length / 20 + 1}`);

      reviews = await getPageReviews(page, reviews);

      const nextSelector = await page.waitForSelector(
        '[name="pagination-button-next"]',
        {
          visible: true,
        }
      );
      const isDisabled =
        (await page.$(
          '[name="pagination-button-next"][aria-disabled="true"]'
        )) !== null;

      isBtnDisabled = isDisabled;
      if (!isDisabled) {
        let nextPage = await nextSelector?.evaluate((el) => el.href);
        await page.goto(nextPage, {
          waitUntil: "load",
        });
      }
    }
    const data = { reviews, url: url, count: reviews.length };

    // console.log(data);
    // res.json({ data: data });
    callback(data);
  } catch (error) {
    // console.log(error);
    // res.status(400).json({ data: error });
    callback(error);
  } finally {
    await browser.close();
  }
};

async function getPageReviews(page, pageReviews) {
  const reviews = await page.$$('[class*="styles_cardWrapper__"]');
  for (const review of reviews.slice()) {
    let name;
    let avatar;
    let location;
    let rating;
    let date;
    let title;
    let body;
    let verified;
    let url;
    let id;

    //NAME
    try {
      const nameSelector = await review.waitForSelector(
        "[data-consumer-name-typography]"
      );
      name = await nameSelector?.evaluate((el) => el.innerText);
    } catch (error) {
      console.log(error);
    }

    //AVATAR
    try {
      const avatarSelector = await review.$("[data-consumer-avatar-image]");
      if (avatarSelector) {
        const profileSelector = await review.$('[name="consumer-profile"]');
        let userID = await profileSelector?.evaluate(
          (el) => el.href.split("/users/")[1]
        );
        avatar = `https://user-images.trustpilot.com/${userID}/73x73.png`;
        // console.log(avatar);
      }
    } catch (error) {
      console.log(error);
    }

    //VERIFIED
    try {
      const verifiedSelector = await review.$("[class*=styles_badge__]");
      verified = verifiedSelector ? true : false;
    } catch (error) {
      console.log(error);
    }

    //LOCATION
    try {
      const locationSelector = await review.$(
        "[data-consumer-country-typography]"
      );
      location = await locationSelector?.evaluate((el) => el.innerText);
    } catch (error) {
      console.log(error);
    }

    //RATING
    try {
      const ratingSelector = await review.$("[data-service-review-rating]");
      rating = await ratingSelector?.evaluate((el) =>
        parseInt(el.getAttribute("data-service-review-rating"))
      );
    } catch (error) {
      console.log(error);
    }

    //DATE
    try {
      const dateSelector = await review.$(
        "[data-service-review-date-of-experience-typography]"
      );
      date = new Date(
        await dateSelector?.evaluate((el) => el.innerText.slice(20))
      );
    } catch (error) {
      console.log(error);
    }

    //TITLE
    try {
      const titleSelector = await review.$(
        "[data-service-review-title-typography]"
      );
      title = await titleSelector?.evaluate((el) => el.innerText);
    } catch (error) {
      console.log(error);
    }

    //BODY
    try {
      const bodySelector = await review.$(
        "[data-service-review-text-typography]"
      );
      body = await bodySelector?.evaluate((el) =>
        el.innerText.replace(/\n/g, " ")
      );
    } catch (error) {
      console.log(error);
    }

    //EXTERNAL USER ID & URL
    try {
      const urlSelector = await review.waitForSelector(
        "[data-review-title-typography]"
      );
      url = await urlSelector?.evaluate((el) => el.href);
      id = await urlSelector?.evaluate((el) => el.href.split("/reviews/")[1]);
    } catch (error) {
      console.log(error);
    }

    pageReviews.push({
      id,
      name,
      avatar,
      verified,
      location,
      rating,
      date,
      title,
      body,
      url,
    });
  }
  // console.log(pageReviews);
  return pageReviews;
}
function callback(data) {
  var requestOptions = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ data: data }),
  };

  fetch(
    "https://canvasworkbench.bubbleapps.io/version-test/api/1.1/wf/trustpilot_webhook",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}

module.exports = { scrapeLogic };
