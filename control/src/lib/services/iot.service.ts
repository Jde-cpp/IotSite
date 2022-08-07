import { Table, IGraphQL, Mutation, DateUtilities } from 'jde-framework';

@Injectable( {providedIn: 'root'} )
export class IotService implements IGraphQL
{
	constructor( @Inject('IAuth') public authorizationService:IAuth, @Inject('IErrorService') private cnsl: IErrorService )
	{}
}