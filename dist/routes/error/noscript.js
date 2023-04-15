"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.rs.html.head = `<script nonce="${res.rs.server.nonce}">window.location.href = '/';</script>`;
    res.rs.html.meta = {
        'title': 'Disabled JavaScript',
        'description': 'This site requires JavaScript to be enabled to function properly.',
        'img': `${res.rs.conf.root}/resources/img/meta-icon.webp`
    };
    res.rs.error = {
        'code': 'JavaScript is not enabled',
        'message': 'Please enable JavaScript to view this website.',
        'imgPath': '/resources/svg/alex-skunk/dizzy.svg',
        'imgAlt': 'Alex Skunk dizzy on the floor'
    };
    yield res.renderDefault('layout-http-error.ejs', { 'checkBannedUser': false });
}));
module.exports = router;
//# sourceMappingURL=noscript.js.map