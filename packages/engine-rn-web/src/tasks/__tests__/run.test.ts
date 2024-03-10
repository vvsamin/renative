import { createRnvContext, getAppFolder, getContext, getPlatformProjectDir } from '@rnv/core';
import taskRun from '../taskRun';
import { runWebpackServer } from '@rnv/sdk-webpack';
import { runTizen } from '@rnv/sdk-tizen';

jest.mock('fs');
jest.mock('path');
jest.mock('axios');
jest.mock('@rnv/core');
jest.mock('process');
jest.mock('@rnv/sdk-webpack');
jest.mock('@rnv/sdk-tizen');
jest.mock('@rnv/sdk-utils');

beforeEach(() => {
    createRnvContext();
});

afterEach(() => {
    jest.resetAllMocks();
});

test('Execute task.rnv.run -p web', async () => {
    //GIVEN
    const ctx = getContext();
    ctx.platform = 'web';

    jest.mocked(getAppFolder).mockReturnValueOnce('MOCKED_PATH');
    //WHEN
    await taskRun.fn?.(ctx);
    //THEN
    expect(runWebpackServer).toHaveBeenCalled();
});

test('Execute task.rnv.run -p tizen', async () => {
    //GIVEN
    const ctx = getContext();
    ctx.platform = 'tizen';
    jest.mocked(getPlatformProjectDir).mockReturnValue('');
    //WHEN
    await taskRun.fn?.(ctx);
    //THEN
    expect(runTizen).toHaveBeenCalled();
});