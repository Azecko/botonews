import { Request, Response } from 'express';
import { getAllSubscriptions } from '../DB';
import { fetchActu } from '../FetchActu';
import { fetchGoEpfl } from '../FetchGoEpfl';

const home = async (req: any, res: Response) => {

  // let's set our variables
  let news:any = [];
  let user:any = {};
  let subscriptions:any = [];
  let splashPageSubscription:any = {}

  if (req.session.passport?.user?.provider?.userid && req.user) { // User is logged in

    user = req.session.passport.user.provider
    subscriptions = await getAllSubscriptions(req.session.passport.user.provider.userid)
    splashPageSubscription = subscriptions.subscriptions.find((e:any) => e.support.title === 'SplashPage')
    if (!splashPageSubscription) {
      // Set the default subscription
      splashPageSubscription = {
        "subscription": "FAKE",
        "support": {
            "title": "SplashPage",
            "is_unique": 1
        },
        "modalities": {},
        "sources": [ {"title": "Go"} ]
      }
    }
    for (let element of splashPageSubscription.sources) {
      // TODO: find a way to dynamically call fetch method based on element.title
      switch(element.title) {
        case "Go":
          let goEpfl: BotonewsItem[] = await fetchGoEpfl({number: 5});
          news = news.concat(goEpfl);
        break;
        case "Actu":
          let actu: BotonewsItem[] = await fetchActu({number: 5});
          news = news.concat(actu);
        break;
      }
    }

  } else { // User is not logged in

    let goEpfl: BotonewsItem[] = await fetchGoEpfl({number: 5});
    news = news.concat(goEpfl);
    let actu: BotonewsItem[] = await fetchActu({number: 5});
    news = news.concat(actu);

  }

  res.render('homepage',  {user, subscriptions, news, splashPageSubscription});
};

export default home;
