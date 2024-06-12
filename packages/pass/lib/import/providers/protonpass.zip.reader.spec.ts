import fs from 'fs';

import { readProtonPassZIP } from '@proton/pass/lib/import/providers/protonpass.zip.reader';
import type { ImportPayload } from '@proton/pass/lib/import/types';
import type { ItemImportIntent } from '@proton/pass/types';
import { deobfuscate } from '@proton/pass/utils/obfuscate/xor';

describe('Import Proton Pass ZIP', () => {
    let oldFormatPayload: ImportPayload;

    beforeAll(async () => {
        const oldFormatData = await fs.promises.readFile(__dirname + '/mocks/protonpass_1.17.zip');
        oldFormatPayload = await readProtonPassZIP({
            data: oldFormatData,
            userId: '5sxjHzI4mlMVq7-ysH-4YxgbEXsNTUlqmVmosbQKL_NgKXe_E0MroEgbKxH2wHTXXtLS3qr1JR_15SWL5kTVOQ==',
        });
    });

    it('should be compatible with the old format having username instead of itemEmail & itemUsername', async () => {
        const [vault] = oldFormatPayload.vaults;

        const { items } = vault;

        const noteItem = items[1] as ItemImportIntent<'note'>;
        expect(noteItem.type).toEqual('note');
        expect(noteItem.metadata.name).toEqual('note title');
        expect(deobfuscate(noteItem.metadata.note)).toEqual('this is my note');
        expect(noteItem.content).toEqual({});
        expect(noteItem.createTime).toEqual(1706621831);
        expect(noteItem.modifyTime).toEqual(1707735222);

        const loginItem = items[2] as ItemImportIntent<'login'>;
        expect(loginItem.type).toEqual('login');
        expect(loginItem.metadata.name).toEqual('login title');
        expect(deobfuscate(loginItem.metadata.note)).toEqual('login note');
        expect(deobfuscate(loginItem.content.itemEmail)).toEqual('john');
        expect(deobfuscate(loginItem.content.itemUsername)).toEqual('');
        expect(deobfuscate(loginItem.content.password)).toEqual('password123');
        expect(loginItem.content.urls).toEqual(['https://example.com/', 'https://proton.me/']);
        expect(deobfuscate(loginItem.content.totpUri)).toEqual(
            'otpauth://totp/login%20title:example%40example.com?issuer=login%20title&secret=ABCDEF&algorithm=SHA1&digits=6&period=30'
        );
        expect(loginItem.createTime).toEqual(1707735320);
        expect(loginItem.modifyTime).toEqual(1707735349);
    });
});
